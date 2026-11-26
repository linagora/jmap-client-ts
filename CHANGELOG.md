# Changelog

## Unreleased

### Fixed

- `expandUriTemplate` scans a template with many unclosed `{` in linear time
  instead of quadratic time.

## 2.0.0-alpha.1

### Added

- `UnauthenticatedBlobAccess/set` and its capability
  (`com:linagora:params:jmap:unauthenticated:blob:access`) in the Linagora
  entry: a short-lived token to download a blob without authentication.

## 2.0.0-alpha.0

Complete rewrite. Nothing from 1.x is kept.

### Breaking changes

- Published as `@linagora/jmap-client-ts` (1.x stays as `jmap-client-ts`).
- ESM only, Node.js 20+ or browsers. The `Client` class, the transports
  (`FetchTransport`, `AxiosTransport`, `XmlHttpRequestTransport`) and the
  per-method helpers (`mailbox_get`, `email_set`, …) are removed.
- Migration: create the client with `createClient({ sessionUrl, auth })`,
  then use `client.call('Mailbox/get', args)` for one call or
  `client.request(b => [...])` for several calls in one request.
  Authentication goes through `auth.getAuthorizationHeader` instead of
  `accessToken`; pass `fetch` to replace the transport.
- `accountId` is no longer substituted when `null`: use
  `client.getPrimaryAccountId()`.

### Added

- Several method calls per request with typed back-references
  (`'#ids': handle.ref('/ids')`) and `createdIds`.
- `using` computed from the methods of the request.
- Method registry `JmapMethods`, extensible through declaration merging,
  with `methodCapabilities` for extension methods.
- Responses narrowed to the requested `properties`, including `header:*`
  forms.
- Types for RFC 8620, RFC 8621 (every Email property), RFC 9425 quotas and
  RFC 9007 MDN.
- Session cache, `refreshSession`, `onSessionChange` on `sessionState`
  changes, `overrideApiUrl`.
- Injectable authentication with a single retry on HTTP 401.
- Error classes `JmapMethodError`, `JmapRequestError`, `JmapHttpError`,
  `JmapSetError`, `JmapInvalidResponseError` and `assertSetSucceeded`.
- Blob upload (raw body, 200 and 201 accepted), `getDownloadUrl` and
  authenticated `download`.
- WebSocket push (RFC 8887) with Linagora tickets, reconnection with backoff
  and jitter, optional `Core/echo` ping.
- Integration tests against `linagora/tmail-backend:memory-1.0.21.2`.
- `@linagora/jmap-client-ts/linagora` entry point: tmail-backend methods (`Label`,
  `Forward`, `Filter`, `Settings`, `EmailRecoveryAction`,
  `TMailContact/autocomplete`, `PublicAsset`, `Mailbox/clear`,
  `CalendarEvent`, `CalendarEventAttendance/get`,
  `CalendarEventCounter/accept`), `LINAGORA_CAPABILITIES`,
  `LINAGORA_METHOD_CAPABILITIES`, `Mailbox.namespace` and
  `Identity.sortOrder`.
- Integration tests of these methods; the integration backend now enables
  the deleted messages vault.
