# @linagora/jmap-client-ts v2 — API contract

Status: draft, agreed before implementation. The Twake Mail React frontend
(`Crash--/twake-mail-frontend`) is written against this contract in parallel;
changes to the public surface must be reflected here first.

## Goals

- JMAP core (RFC 8620), mail (RFC 8621), WebSocket push (RFC 8887), quotas
  (RFC 9425), MDN (RFC 9007).
- Several method calls per request, with typed result references
  (`#ids` → `ResultReference`).
- **Extensible**: apps and companion packages declare extra methods
  (Linagora / James extensions) through TypeScript declaration merging, without
  forking.
- Auth-agnostic: the caller provides the `Authorization` header (Bearer from
  OIDC with refresh, or Basic) and is told when the server answers 401.
- Runtime-agnostic: browser and Node 20+, ESM only, `fetch` injectable.
- No runtime dependency. Types are our own (`src/types/`): `jmap-rfc-types`
  was evaluated and not used (see "Implementation notes").

## Toolchain

ESM only, TypeScript 5 strict, tsdown (or tsup) build to `dist/` with `.d.ts`,
vitest, ESLint 9 flat + Prettier 3, Node 24 (`.nvmrc`), GitHub Actions CI.
Integration tests run against `linagora/tmail-backend:memory-1.0.21.2`.

## Creating a client

```ts
import { createClient } from '@linagora/jmap-client-ts'

const client = createClient({
  sessionUrl: 'https://jmap.example.com/jmap/session',
  auth: {
    // Called before every HTTP request (JMAP API, upload, download, ticket).
    getAuthorizationHeader: async () => `Bearer ${await tokens.getAccessToken()}`,
    // Optional. Called once on HTTP 401. Resolve true if credentials were
    // refreshed: the request is then retried once.
    onUnauthorized: async () => tokens.refresh()
  },
  fetch: globalThis.fetch, // optional
  overrideApiUrl: undefined, // optional, e.g. when the session advertises an internal host
  // Required as soon as JmapMethods is extended (see "Typing and extensions"):
  // types are erased at runtime, so the client needs each extension
  // method's capability to build `using`. Checked against the declarations.
  methodCapabilities: { 'Label/get': 'com:linagora:params:jmap:labels' }
})
```

## Session

```ts
const session = await client.getSession()      // fetched once, cached
await client.refreshSession()                  // forced re-fetch
client.getPrimaryAccountId('urn:ietf:params:jmap:mail') // string, throws if absent (default: mail)
client.hasCapability('com:linagora:params:jmap:labels')  // boolean
client.hasCapability('urn:ietf:params:jmap:quota', accountId) // account-level capability
const unsubscribe = client.onSessionChange(listener) // fires when a response's sessionState differs; client re-fetches first
```

`getPrimaryAccountId`, `hasCapability` and `getDownloadUrl` are synchronous:
they throw a `JmapError` until the session is loaded (`await
client.getSession()` once at startup). `onSessionChange` also fires when
`refreshSession()` returns a new state.

## Calling methods

```ts
// One call
const mailboxes = await client.call('Mailbox/get', { accountId, ids: null })

// Several calls in one request, with back-references
const [query, emails] = await client.request(b => {
  const q = b.call('Email/query', { accountId, filter: { inMailbox }, sort, limit: 50 })
  const g = b.call('Email/get', {
    accountId,
    '#ids': q.ref('/ids'),
    properties: ['id', 'subject', 'from', 'receivedAt', 'keywords', 'preview']
  })
  return [q, g] as const
})
```

- `b.call()` returns a handle whose `ref(path)` builds a typed
  `ResultReference`. The awaited tuple holds each call's typed response.
  `as const` is optional (the tuple type is inferred).
- Known paths (`/ids`, `/list/*/threadId`, … up to three segments of the
  narrowed response) are suggested and typed; a reference whose value does
  not fit the argument (`'#ids': q.ref('/total')`) is a type error. Other
  paths are accepted unchecked.
- Handles are thenables: `await handle` (after the request) gives that
  call's response or throws its `JmapMethodError`. `client.request` rejects
  with the first `JmapMethodError` among the returned handles.
- `client.requestSettled(build, options)` has the same signature but
  resolves each returned handle to `{ ok: true, value }` or
  `{ ok: false, error: JmapMethodError }` (request-level failures still
  reject).
- Missing required arguments (neither `key` nor `#key`) and unknown
  arguments are type errors; `key` and `#key` together throw at runtime.
- `call`, `request`, `upload` and `download` accept `{ signal }`.
- `using` is computed from the methods present in the request (each method
  declares its capability), plus `extraCapabilities?: string[]` passed to
  `client.request(build, { extraCapabilities })`.
- `createdIds` is supported via `client.request(build, { createdIds })` and
  returned on the result object (`result.createdIds`).

## Typing and extensions

All method signatures live in one interface that callers can extend:

```ts
export interface JmapMethods {
  'Mailbox/get': { capability: 'urn:ietf:params:jmap:mail'; args: GetArgs<Mailbox>; response: GetResponse<Mailbox> }
  // ...
}

// In an app or a companion package:
declare module '@linagora/jmap-client-ts' {
  interface JmapMethods {
    'Label/get': { capability: 'com:linagora:params:jmap:labels'; args: GetArgs<Label>; response: GetResponse<Label> }
  }
}
```

Declaring an extension method makes `methodCapabilities` required in
`createClient` (one entry per extension method, value checked against the
declared `capability`).

Generic helpers `GetArgs<T>`, `GetResponse<T>`, `SetArgs<T>`, `SetResponse<T>`,
`QueryArgs<Filter, Comparator>`, `QueryResponse`, `ChangesArgs`,
`ChangesResponse`, `QueryChangesArgs`, `QueryChangesResponse` are exported so
extension methods are one-liners. When `properties` is given, `get` responses
narrow `list` to those properties (plus `id`, always returned by the server);
this works for extension methods too.

Built-in methods (v2.0):
Core/echo; Mailbox get/changes/query/queryChanges/set; Thread get/changes;
Email get/changes/query/queryChanges/set/copy/import/parse; SearchSnippet/get;
Identity get/changes/set; EmailSubmission get/changes/query/queryChanges/set;
VacationResponse get/set; Quota get/changes/query/queryChanges (RFC 9425);
MDN send/parse (RFC 9007).

Keywords are `Record<string, true>` (custom keywords allowed: labels use them).
`Email` covers every RFC 8621 property, including header forms
(`header:X:asText`, …) through a template literal index signature. When a
header property is requested in `Email/get`, its narrowed type follows the
form (`header:X:asText` → `string | null`, `header:X:asAddresses:all` →
`EmailAddress[][]`, …).

## Errors

All errors extend `JmapError`.

- `JmapMethodError` — a method answered `["error", {type, description}, id]`.
  Carries `type`, `description` (`string | null`), `methodName`, `callId`,
  and `details` (all error arguments, e.g. `properties`). Thrown when
  awaiting that call's handle (other calls in the same request still
  resolve).
- `JmapRequestError` — request-level problem (RFC 7807 JSON): `type`, `status`,
  `detail`, `limit` (`string | null`), `problem` (raw document).
- `JmapHttpError` — any other non-2xx: `status`, `statusText`, `body` (text).
- `/set` partial failures stay in the response (`notCreated`, `notUpdated`,
  `notDestroyed`); helper `assertSetSucceeded(response)` throws
  `JmapSetError` listing them, and returns the response otherwise.
- `JmapInvalidResponseError` — the server answered something that is not
  valid JMAP (not JSON, missing response for a call, …).

## Blobs

```ts
const { blobId, type, size } = await client.upload(accountId, fileOrBlob, contentType?)
const url = client.getDownloadUrl({ accountId, blobId, name, type })   // template expanded
const blob = await client.download({ accountId, blobId, name, type })  // fetch with auth
```

Upload accepts 200 and 201, sends the body untouched (no JSON encoding).
`fileOrBlob` is a `Blob` or a `BufferSource`; the content type defaults to the
Blob type, then `application/octet-stream`. `name` defaults to the blob id and
`type` to `application/octet-stream` in download URLs.

## Push (WebSocket, RFC 8887)

```ts
const push = client.connectWebSocket({
  dataTypes: ['Email', 'Mailbox', 'Thread', 'EmailDelivery'], // or null for all
  pushState,                    // optional, resume
  ping: { intervalMs: 30_000 }, // optional, echo-based keepalive (Core/echo)
  reconnect: { initialDelayMs: 1_000, maxDelayMs: 30_000 }, // optional, or false
  WebSocket: globalThis.WebSocket // optional, injectable implementation
})
const off = push.on('stateChange', change => { /* change.changed[accountId].Email = 'newState' */ })
push.on('status', s => { /* 'connecting' | 'open' | 'closed' | 'reconnecting' */ })
push.on('error', e => { /* transient: ticket failure, socket error, server RequestError */ })
push.pushState // last pushState received
push.status
push.close()
```

`on()` returns its unsubscribe function. `closed` is final: after
`close()`, when `reconnect` is `false`, or when the server has no WebSocket
push (`JmapPushNotSupportedError` is emitted on `error`).

- Authentication: if the session has `com:linagora:params:jmap:ws:ticket`
  (session or primary account capability, confirmed in jmap-dart-client and
  tmail-flutter: properties `generationEndpoint` / `revocationEndpoint`,
  ticket obtained by `POST generationEndpoint` with the auth header, answer
  `{ value, clientAddress, generatedOn, validUntil, username }`), the
  `value` is passed as `?ticket=` in the WebSocket URL (browsers cannot set
  headers on WebSocket). Otherwise rely on cookies / same origin. The
  `jmap` subprotocol is requested.
- Reconnects with exponential backoff and jitter, fetching a fresh ticket each
  time. Exposes the last `pushState`.
- Requests over the WebSocket are out of scope for v2.0 (HTTP is used for API
  calls).

## Not in v2.0

EventSource push, PushSubscription, Blob/copy, Sieve.

## Linagora extensions (`@linagora/jmap-client-ts/linagora`)

A second entry point declares the tmail-backend methods through the
extension mechanism above (`declare module '@linagora/jmap-client-ts'`), so importing
it makes `methodCapabilities` required; it exports
`LINAGORA_METHOD_CAPABILITIES` (one entry per method) and
`LINAGORA_CAPABILITIES` (URNs), plus the object and capability types.

- `Label/get|changes|set`, `Forward/get|set`, `Filter/get|set`,
  `Settings/get|set`, `EmailRecoveryAction/get|set`,
  `TMailContact/autocomplete`, `PublicAsset/get|set`, `Mailbox/clear`,
  `CalendarEvent/parse|accept|reject|maybe`, `CalendarEventAttendance/get`,
  `CalendarEventCounter/accept` (with `counterSupport`),
  `UnauthenticatedBlobAccess/set` (`create` only, no state).
- `Mailbox.namespace` (James shares) and `Identity.sortOrder` (James).
- Singletons (`Forward`, `Settings`): `/set` without `create` nor `destroy`.
  `Filter/set` takes `update: { singleton: Rule[] }` (the whole list, each
  rule with an `id`), not a patch.
- Typed as tmail-backend behaves where it differs from its documentation:
  `EmailRecoveryAction/get|set` answer without `accountId` nor `state`;
  recovery statuses are James task statuses (`completed`, `canceled`,
  `canceledRequested`); `maxEmailRecoveryPerRequest` comes as a string;
  `Filter/get` returns rules without `id`; `PublicAsset.publicURI` holds the
  username, not the account id.
- `CalendarEventAttendance/get` answers `eventAttendanceStatus` (the
  documentation says `attendanceStatus`); parsed events carry `utcStart`,
  `utcEnd` and `status`.
- Not declared yet: `FolderFilteringAction/*` (filter capability version 2).

The entry has no runtime import (`import type` only), and its own TypeScript
programs (`src/linagora/tsconfig.json`, `tests/linagora/`) so that the core
tests keep `methodCapabilities` optional.

## Implementation notes (2.0.0-alpha.0)

Differences from the first draft of this contract, all additive:

- `createClient({ methodCapabilities })`, required once `JmapMethods` is
  extended (runtime counterpart of the declared `capability`).
- Built-in methods add the capabilities they depend on to `using`
  (`Identity/*` and `EmailSubmission/*`: mail + submission,
  `VacationResponse/*`: mail + vacationresponse, `MDN/*`: mail + mdn).
- `getPrimaryAccountId(capability?)` defaults to mail;
  `hasCapability(capability, accountId?)`.
- `JmapError` base class, `JmapInvalidResponseError`,
  `JmapPushNotSupportedError`; `JmapMethodError.details`.
- Push: `error` event, `reconnect` and `WebSocket` options, `status` and
  `pushState` getters.
- `{ signal }` on `call`, `request`, `upload`, `download`.
- `client.requestSettled` (per-call outcomes).
- Arguments are typed without inferring the whole object (only
  `properties` is inferred), so nested typos stay compile errors.
- `Quota/queryChanges` (defined by RFC 9425).
- `jmap-rfc-types` 0.5.0 is not used: it publishes raw `.ts` sources
  (consumers compile them with their own settings, imports with `.ts`
  extensions), depends on `type-fest` at install time, has no Quota nor MDN
  types, and its typing model (`Exact`, separate request/response maps)
  does not fit the declaration-merging registry. The builder and the
  `properties` narrowing were written from scratch after reading jmap-jam's
  approach; no code was copied.
