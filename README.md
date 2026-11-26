# @linagora/jmap-client-ts

Typed [JMAP](https://jmap.io) client for browsers and Node.js 20+.

- JMAP core ([RFC 8620](https://www.rfc-editor.org/rfc/rfc8620)), mail
  ([RFC 8621](https://www.rfc-editor.org/rfc/rfc8621)), WebSocket push
  ([RFC 8887](https://www.rfc-editor.org/rfc/rfc8887)), quotas
  ([RFC 9425](https://www.rfc-editor.org/rfc/rfc9425)) and MDN
  ([RFC 9007](https://www.rfc-editor.org/rfc/rfc9007)).
- Several method calls per request, with typed back-references.
- Responses narrowed to the `properties` you ask for.
- Extensible: declare your own methods (server extensions) with TypeScript
  declaration merging.
- Bring your own authentication (Bearer, Basic, cookies) and `fetch`.
- ESM only, no runtime dependency.

> Version 2 is a rewrite and is not compatible with 1.x. It is published as
> `@linagora/jmap-client-ts`; 1.x stays on npm as `jmap-client-ts`. See the
> [CHANGELOG](CHANGELOG.md) and the [API contract](docs/v2-api.md).

## Install

Prereleases of 2.0 are published under the `next` tag:

```bash
npm install @linagora/jmap-client-ts@next
```

## Quick start

```ts
import { assertSetSucceeded, createClient } from '@linagora/jmap-client-ts';

const client = createClient({
  sessionUrl: 'https://jmap.example.com/jmap/session',
  auth: {
    // Called before every HTTP request.
    getAuthorizationHeader: async () => `Bearer ${await tokens.getAccessToken()}`,
    // Optional: called once on HTTP 401; resolve true to retry once.
    onUnauthorized: async () => tokens.refresh(),
  },
});

await client.getSession();
const accountId = client.getPrimaryAccountId(); // mail by default

// One call
const { list: mailboxes } = await client.call('Mailbox/get', { accountId, ids: null });
const inbox = mailboxes.find(mailbox => mailbox.role === 'inbox');

// Several calls in one request, with a back-reference
const [query, emails] = await client.request(b => {
  const q = b.call('Email/query', {
    accountId,
    filter: { inMailbox: inbox?.id },
    sort: [{ property: 'receivedAt', isAscending: false }],
    limit: 50,
    calculateTotal: true,
  });
  const g = b.call('Email/get', {
    accountId,
    '#ids': q.ref('/ids'),
    properties: ['subject', 'from', 'receivedAt', 'keywords', 'preview'],
  });
  return [q, g];
});

// emails.list is typed { id, subject, from, receivedAt, keywords, preview }[]
console.log(query.total, emails.list[0]?.subject);
```

### Creating and sending an email

```ts
const [created, submitted] = await client.request(b => [
  b.call('Email/set', {
    accountId,
    create: {
      draft: {
        mailboxIds: { [draftsId]: true },
        keywords: { $draft: true, $seen: true },
        from: [{ name: 'Bob', email: 'bob@example.com' }],
        to: [{ name: 'Alice', email: 'alice@example.com' }],
        subject: 'Hello',
        bodyValues: { body: { value: 'Hi Alice' } },
        textBody: [{ partId: 'body', type: 'text/plain' }],
      },
    },
  }),
  b.call('EmailSubmission/set', {
    accountId,
    create: { send: { identityId, emailId: '#draft' } },
    onSuccessUpdateEmail: {
      '#send': {
        [`mailboxIds/${draftsId}`]: null,
        [`mailboxIds/${sentId}`]: true,
        'keywords/$draft': null,
      },
    },
  }),
]);
assertSetSucceeded(created); // throws JmapSetError on notCreated/notUpdated/notDestroyed
assertSetSucceeded(submitted);
```

Arguments are checked: a missing required argument (unless given as a
`#back-reference`), an unknown argument or a typo in a nested object is a
compile error.

### Session

```ts
await client.getSession(); // fetched once, then cached
await client.refreshSession();
client.hasCapability('urn:ietf:params:jmap:quota'); // session level
client.hasCapability('urn:ietf:params:jmap:quota', accountId); // account level
const unsubscribe = client.onSessionChange(session => {
  // A response carried a new sessionState: the session was re-fetched.
});
```

`getPrimaryAccountId`, `hasCapability` and `getDownloadUrl` are synchronous
and throw until the session is loaded. Use `overrideApiUrl` when the session
advertises an `apiUrl` the client cannot reach. `call`, `request`, `upload`
and `download` accept an `AbortSignal` (`{ signal }`).

### Errors

| Error                       | When                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `JmapMethodError`           | A call answered `error` (`type`, `description`, `methodName`, `callId`, `details`) |
| `JmapRequestError`          | Request-level problem document (`type`, `status`, `detail`, `limit`)               |
| `JmapHttpError`             | Any other non-2xx answer (`status`, `statusText`, `body`)                          |
| `JmapSetError`              | Thrown by `assertSetSucceeded` (`notCreated`, `notUpdated`, `notDestroyed`)        |
| `JmapInvalidResponseError`  | The server did not answer valid JMAP                                               |
| `JmapPushNotSupportedError` | Emitted on the push `error` event when the server has no WebSocket push            |

All extend `JmapError`. `client.request` rejects with the first method
error among the returned handles (each handle is also a thenable for its own
call). `client.requestSettled` reports each call instead, for optional
results:

```ts
const [emails, snippets] = await client.requestSettled(b => {
  const q = b.call('Email/query', { accountId, filter: { text: 'invoice' } });
  return [
    b.call('Email/get', { accountId, '#ids': q.ref('/ids'), properties: ['subject'] }),
    b.call('SearchSnippet/get', {
      accountId,
      filter: { text: 'invoice' },
      '#emailIds': q.ref('/ids'),
    }),
  ];
});
if (emails.ok) render(emails.value.list, snippets.ok ? snippets.value.list : []);
```

## Blobs

```ts
const { blobId, size, type } = await client.upload(accountId, file); // File, Blob or BufferSource
const url = client.getDownloadUrl({
  accountId,
  blobId,
  name: 'report.pdf',
  type: 'application/pdf',
});
const blob = await client.download({ accountId, blobId, name: 'report.pdf' }); // with auth
```

## Push over WebSocket

```ts
const push = client.connectWebSocket({
  dataTypes: ['Email', 'Mailbox', 'Thread', 'EmailDelivery'], // or null for all
  pushState: savedPushState, // optional, to resume
  ping: { intervalMs: 30_000 }, // optional Core/echo keepalive
});
push.on('stateChange', change => {
  const emailState = change.changed[accountId]?.Email;
});
push.on('status', status => {
  // 'connecting' | 'open' | 'reconnecting' | 'closed'
});
push.on('error', error => console.warn(error));
// later
savedPushState = push.pushState;
push.close();
```

The connection reconnects with exponential backoff and jitter
(`reconnect: { initialDelayMs, maxDelayMs }`, or `false`). When the session
advertises `com:linagora:params:jmap:ws:ticket` (Twake Mail / TMail), a fresh
ticket is requested before each connection and passed as `?ticket=` (browsers
cannot send an `Authorization` header on a WebSocket); otherwise cookies
apply. Pass `WebSocket` to use another implementation.

## Adding methods

Server extensions are declared in `JmapMethods`. They are then available in
`call` and `request`, with typed arguments, responses, `properties` narrowing
and back-references:

```ts
import type { GetArgs, GetResponse, Id, SetArgs, SetResponse } from '@linagora/jmap-client-ts';

export interface Note {
  id: Id;
  title: string;
  body: string;
}

declare module '@linagora/jmap-client-ts' {
  interface JmapMethods {
    'Note/get': {
      capability: 'urn:example:params:jmap:notes';
      args: GetArgs<Note>;
      response: GetResponse<Note>;
    };
    'Note/set': {
      capability: 'urn:example:params:jmap:notes';
      args: SetArgs<Note>;
      response: SetResponse<Note>;
    };
  }
}
```

Types do not exist at runtime, so the client also needs the capability of
each extension method to build `using`. Once methods are declared,
`methodCapabilities` becomes a required option, checked against the
declarations:

```ts
const client = createClient({
  sessionUrl,
  auth,
  methodCapabilities: {
    'Note/get': 'urn:example:params:jmap:notes',
    'Note/set': 'urn:example:params:jmap:notes',
  },
});

const notes = await client.call('Note/get', {
  accountId,
  ids: null,
  properties: ['title'],
});
// notes.list: { id: string; title: string }[]
```

Use `extraCapabilities` (`client.call(method, args, { extraCapabilities })`)
for capabilities that change the behaviour of built-in methods.

Generic helpers for extensions: `GetArgs`, `GetResponse`, `SetArgs`,
`SetResponse`, `ChangesArgs`, `ChangesResponse`, `QueryArgs`, `QueryResponse`,
`QueryChangesArgs`, `QueryChangesResponse`, `CopyArgs`, `CopyResponse`,
`PatchObject`.

## Linagora extensions

`@linagora/jmap-client-ts/linagora` declares the methods of
[tmail-backend](https://github.com/linagora/tmail-backend) (Twake Mail) and
the James properties it ships, with their types and capabilities:

| Methods                                                                           | Capability (`LINAGORA_CAPABILITIES`) |
| --------------------------------------------------------------------------------- | ------------------------------------ |
| `Label/get`, `Label/changes`, `Label/set`                                         | `labels`                             |
| `Forward/get`, `Forward/set`                                                      | `forward`                            |
| `Filter/get`, `Filter/set`                                                        | `filter`                             |
| `Settings/get`, `Settings/set`                                                    | `settings`                           |
| `EmailRecoveryAction/get`, `EmailRecoveryAction/set`                              | `messagesVault`                      |
| `TMailContact/autocomplete`                                                       | `contactAutocomplete`                |
| `PublicAsset/get`, `PublicAsset/set`                                              | `publicAssets`                       |
| `Mailbox/clear`                                                                   | `mailboxClear` (plus mail)           |
| `CalendarEvent/parse`, `accept`, `reject`, `maybe`, `CalendarEventAttendance/get` | `calendarEvent`                      |

It also adds `Mailbox.namespace` (James shares) and `Identity.sortOrder`
(pass `LINAGORA_CAPABILITIES.jamesIdentitySortOrder` in
`extraCapabilities`).

```ts
import { createClient } from '@linagora/jmap-client-ts';
import {
  LINAGORA_CAPABILITIES,
  LINAGORA_METHOD_CAPABILITIES,
} from '@linagora/jmap-client-ts/linagora';

const client = createClient({ sessionUrl, auth, methodCapabilities: LINAGORA_METHOD_CAPABILITIES });
await client.getSession();
if (client.hasCapability(LINAGORA_CAPABILITIES.labels)) {
  const { list } = await client.call('Label/get', { accountId, ids: null });
}
// Filter/set replaces the whole list; each rule needs an id (Filter/get omits them)
await client.call('Filter/set', {
  accountId,
  update: {
    singleton: [
      {
        id: '1',
        name: 'Newsletters',
        conditionGroup: {
          conditionCombiner: 'AND',
          conditions: [{ field: 'from', comparator: 'contains', value: 'news@' }],
        },
        action: { appendIn: { mailboxIds: [newslettersId] }, markAsSeen: true },
      },
    ],
  },
});
```

Importing the entry point declares the methods for the whole program, so
`methodCapabilities` becomes required: spread `LINAGORA_METHOD_CAPABILITIES`
when you declare methods of your own. What tmail-backend does differently
from its documentation is typed as it behaves: `EmailRecoveryAction`
responses carry neither `accountId` nor `state`, recovery statuses are James
task statuses (`completed`, `canceled`), `maxEmailRecoveryPerRequest` may be
a string, and rules come back from `Filter/get` without their `id`.

## Built-in methods

`Core/echo`; `Mailbox/get|changes|query|queryChanges|set`;
`Thread/get|changes`;
`Email/get|changes|query|queryChanges|set|copy|import|parse`;
`SearchSnippet/get`; `Identity/get|changes|set`;
`EmailSubmission/get|changes|query|queryChanges|set`;
`VacationResponse/get|set`; `Quota/get|changes|query|queryChanges`;
`MDN/send|parse`.

Keywords are `Record<string, true>` (custom keywords allowed). `Email`
covers every RFC 8621 property; header properties such as
`header:List-Id:asText` are typed by their form when requested.

## Development

Node 24 (`nvm use`).

```bash
npm install
npm run lint              # ESLint + Prettier
npm run typecheck         # sources, tests and type tests
npm test                  # unit and type tests (vitest)
npm run build             # dist/ (tsdown)
npm run test:integration  # needs Docker
```

The integration tests start `linagora/tmail-backend:memory-1.0.21.2` with
Docker Compose (project `jmapclient-it`, ports `127.0.0.1:18100` and
`127.0.0.1:18101`, see `JMAP_IT_JMAP_PORT` / `JMAP_IT_WEBADMIN_PORT`), create
the users through WebAdmin, and remove the containers afterwards.
`JMAP_IT_KEEP=1` keeps them running, `JMAP_IT_EXTERNAL=1` reuses a running
backend.

## License

[MIT](LICENSE)
