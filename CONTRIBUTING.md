# Contributing to jmap-client-ts

Contributions are welcome. Open an issue to report a bug or discuss a change
before large pull requests.

## Setup

Use Node 24 (`nvm use` reads `.nvmrc`), then:

```bash
npm install
```

## Checks

```bash
npm run lint       # ESLint 9 + Prettier 3 (npm run lint:fix to fix)
npm run typecheck  # sources, tests and type tests
npm test           # unit and type tests (vitest)
npm run build      # dist/ with tsdown
```

Integration tests need Docker and start a disposable
`linagora/tmail-backend` (Docker Compose project `jmapclient-it`, ports bound
to 127.0.0.1 only):

```bash
npm run test:integration
```

## Public API

The public surface is described in [docs/v2-api.md](docs/v2-api.md). Update
it in the same pull request as any change of the API.

## Commits

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `docs:`, `test:`, `chore:`, …), one subject per commit,
subject in the imperative mood.

## Publishing

Prereleases are published to npm under the `next` tag by
`.github/workflows/npm-publish.yml`, with npm trusted publishing (OIDC): no
npm token is stored in GitHub.

1. Set `version` in `package.json` (for example `2.0.0-alpha.1`) and move the
   `Unreleased` entries of the changelog under that version.
2. Create a GitHub release marked as a prerelease, with the tag `v<version>`
   on the commit to publish.

The workflow fails if the tag does not match `package.json`. It runs in the
`npm` GitHub environment, which must match the trusted publisher configured
for `jmap-client-ts` on npmjs.com.
