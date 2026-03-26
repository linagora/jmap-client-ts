# jmap-client-ts

[![npm version](https://img.shields.io/npm/v/jmap-client-ts.svg)](https://www.npmjs.com/package/jmap-client-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A TypeScript client for the [JMAP](https://jmap.io/spec.html) protocol (RFC 8620 / RFC 8621), with a pluggable transport layer supporting Fetch, Axios, and XMLHttpRequest.

## Features

- Full [JMAP Mail](https://jmap.io/spec-mail.html) support: Mailbox, Email, Thread, and EmailSubmission operations
- Pluggable transport layer: use the built-in `FetchTransport`, `AxiosTransport`, or `XmlHttpRequestTransport`
- Automatic `accountId` substitution: pass `null` as `accountId` and it resolves to the primary account
- Session caching: fetch once, reuse across requests
- JMAP capability detection from session response

## Install

```bash
npm install jmap-client-ts
```

## Quick start

```typescript
import { Client } from 'jmap-client-ts';
import { FetchTransport } from 'jmap-client-ts/lib/utils/fetch-transport';

const client = new Client({
  sessionUrl: 'https://jmap.example.com/.well-known/jmap',
  accessToken: 'your-bearer-token',
  transport: new FetchTransport(fetch),
});

// Fetch and cache the JMAP session
await client.fetchSession();

// List all mailboxes (pass null for accountId to use the primary account)
const mailboxes = await client.mailbox_get({
  accountId: null,
  ids: null,
});
console.log(mailboxes.list);
```

## API

### Constructor options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `sessionUrl` | `string` | Yes | JMAP session endpoint (typically `/.well-known/jmap`) |
| `accessToken` | `string` | Yes | Bearer token for authentication |
| `transport` | `Transport` | Yes | HTTP transport implementation |
| `overriddenApiUrl` | `string` | No | Override the API URL from the session |
| `httpHeaders` | `object` | No | Additional HTTP headers for all requests |

### Transport implementations

Choose a transport based on your environment:

```typescript
// Browser or Node.js 18+
import { FetchTransport } from 'jmap-client-ts/lib/utils/fetch-transport';
const transport = new FetchTransport(fetch);

// Node.js with Axios
import { AxiosTransport } from 'jmap-client-ts/lib/utils/axios-transport';
import axios from 'axios';
const transport = new AxiosTransport(axios);

// Legacy browser environments
import { XmlHttpRequestTransport } from 'jmap-client-ts/lib/utils/xml-http-request-transport';
const transport = new XmlHttpRequestTransport();
```

### Session methods

| Method | Returns | Description |
|--------|---------|-------------|
| `fetchSession()` | `Promise<void>` | Fetches and caches the JMAP session |
| `getSession()` | `ISession` | Returns the cached session (throws if not fetched) |
| `getAccountIds()` | `string[]` | Returns all available account IDs |
| `getPrimaryAccountId(capability?)` | `string` | Returns the primary account ID for a capability (defaults to `urn:ietf:params:jmap:mail`) |

### Mailbox methods

| Method | Description |
|--------|-------------|
| `mailbox_get(args)` | Get mailboxes by ID, or all if `ids: null` |
| `mailbox_changes(args)` | Get mailbox changes since a state |
| `mailbox_set(args)` | Create, update, or delete mailboxes |

### Email methods

| Method | Description |
|--------|-------------|
| `email_get(args)` | Get emails by ID |
| `email_query(args)` | Query emails with filters and sorting |
| `email_changes(args)` | Get email changes since a state |
| `email_set(args)` | Create, update, or delete emails |
| `email_import(args)` | Import emails from blobs |

### Thread methods

| Method | Description |
|--------|-------------|
| `thread_get(args)` | Get threads by ID |

### EmailSubmission methods

| Method | Description |
|--------|-------------|
| `emailSubmission_get(args)` | Get submission status |
| `emailSubmission_changes(args)` | Get submission changes since a state |
| `emailSubmission_set(args)` | Submit emails for delivery |

### File upload

| Method | Description |
|--------|-------------|
| `upload(buffer, type?)` | Upload a binary blob (for attachments), returns `{ blobId, type, size }` |

## Examples

### Query recent emails

```typescript
// Get the 10 most recent emails
const result = await client.email_query({
  accountId: null,
  filter: { inMailbox: 'inbox-id' },
  sort: [{ property: 'receivedAt', isAscending: false }],
  limit: 10,
});

// Fetch full email details
const emails = await client.email_get({
  accountId: null,
  ids: result.ids,
  properties: ['from', 'subject', 'receivedAt', 'preview'],
});
```

### Create a mailbox

```typescript
const response = await client.mailbox_set({
  accountId: null,
  create: {
    newMailbox: {
      name: 'My Folder',
      parentId: null,
    },
  },
});
```

### Send an email

```typescript
// Create a draft
const draft = await client.email_set({
  accountId: null,
  create: {
    draft: {
      from: [{ email: 'me@example.com' }],
      to: [{ email: 'them@example.com' }],
      subject: 'Hello from jmap-client-ts',
      textBody: [{ partId: '1', type: 'text/plain' }],
      bodyValues: { '1': { value: 'Hello!' } },
      mailboxIds: { 'outbox-id': true },
    },
  },
});

// Submit for delivery
await client.emailSubmission_set({
  accountId: null,
  create: {
    submission: {
      emailId: draft.created!.draft.id,
      envelope: {
        mailFrom: { email: 'me@example.com' },
        rcptTo: [{ email: 'them@example.com' }],
      },
    },
  },
});
```

## Development

### Prerequisites

- Node.js >= 14
- Docker (for integration tests)

### Setup

```bash
git clone https://github.com/linagora/jmap-client-ts.git
cd jmap-client-ts
npm install
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `lib/` |
| `npm run lint` | Check code formatting with ESLint + Prettier |
| `npm run lint:fix` | Auto-fix formatting issues |
| `npm test` | Run tests (requires Docker) |

### Running tests

Tests use [testcontainers](https://github.com/testcontainers/testcontainers-node) to spin up a [tmail-backend](https://github.com/linagora/tmail-backend) instance. Pull the Docker image first to avoid timeouts:

```bash
docker pull linagora/tmail-backend:memory-0.5.0
npm test
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on commit conventions, code formatting, and the PR workflow.

## License

[MIT](LICENSE) - Linagora
