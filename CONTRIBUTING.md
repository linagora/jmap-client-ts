# Contributing to jmap-client-ts

Contributions on this project are greatly appreciated, here is a guide to help you contribute.

## Creating Issues

Issues can be created to report bugs, project tasks, feature requests. Do not hesitate to create one if needed after verifying it does not already exists.

## Setup the Project

Start by forking then cloning the repository.

Run `npm install` to install dependencies needed for development.

## Formatting the code

We use Prettier and ESLint to format the code. Run `npm run lint` to check the code is correctly formatted or `npm run lint:fix` to format the code.

On VSCode you can also use the [Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

## Git Hooks

[Husky](https://github.com/typicode/husky) is a npm plugin to run local git hooks before committing and pushing. It will for example format the code automatically before committing and running tests before pushing, though you can always skip them using git `--no-verify` parameter.

## Commit Convention

A commit consists of a header, a body and a footer.
```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```
The header must be one line with no more that 50 characters, it should sum up what the commit does.

The body should describe what the commit does if the header is not enough, it can contain multiple lines and other blank lines if needed.

The footer should contain only references to issues. (See [Linking a pull request to an issue using a keyword](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword))

The body and its preceding blank line can be omitted.

The footer and its preceding blank line can be omitted.

## Testing

Once you are done you can run the tests with `npm run test`. They use docker and will need to download docker images the first time you run them, so you should download them before to avoid getting timeout with `docker pull linagora/james-memory:branch-master`

## Pull Request

Once you have comitted and pushed your branch (on your fork), you can open a pull request.

Developpers will review your changes, and make comments if needed. Discussions should be resolved (most of the time) by the initial commenter once the problem is solved.

Some problems might be unrelated to the pull request and need discussions or will be fixed later. An issue should be created in these cases, referencing the discussion in the pull request if needed to keep a trace.

The tests will be run by the continuous integration when a pull request is opened, preventing merging if they fails.

Once the pull request is approved and tests pass on continuous integration, it will be merged on main.