# Contributing to Koobiq

Thank you for helping improve Koobiq. This guide explains how to report a problem, set up the repository and get a pull request merged.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Contributions are accepted under the [MIT License](LICENSE).

## Questions, bugs and ideas

- Ask questions in [GitHub Discussions](https://github.com/koobiq/angular-components/discussions) or the [Telegram chat](https://t.me/koobiq_io), not in issues.
- Report a bug with the [issue form](https://github.com/koobiq/angular-components/issues/new/choose) and add the package version to the description. Search the existing issues first.
- Send a small change straight as a pull request: a fix for a bug, a visual or accessibility defect, performance or browser support, or a correction in the docs.
- Discuss a large change in an issue before writing code: a new component, a change to the design tokens or the visual language, a breaking change, or documentation on a new topic.
- Report vulnerabilities privately as described in the [security policy](.github/security.md), never in a public issue.

## Setup

- Use the Node.js version from [`.nvmrc`](.nvmrc) and the Yarn version checked into the repository (`packageManager` in `package.json`).
- Install the dependencies: `yarn install`.
- Enable the git hooks: `npx husky`. Before each commit they format, lint and spell-check the staged files and validate the commit message.
- Start a dev app for one component: `yarn run dev:<component>`, for example `yarn run dev:button`.

The package layout, the structure of a component and the full list of commands are described in [AGENTS.md](AGENTS.md). The other contributor guides are listed in [docs/guides](docs/guides/00-contributing.md).

## Making a change

1. Fork the repository, or push a branch to it if you have write access.
2. Create a branch from `main`. Do not name it `test/<name>`: the repository already has a `test` branch, so git rejects the push.
3. Make the change along with its tests, documentation in English and Russian and updated API golden files, as the [contribution checklist](docs/guides/01-contribution-checklist.md) lists.
4. Run the checks for what you changed:

    ```bash
    yarn run unit:components                                              # Unit tests (Vitest)
    npx vitest run "<path to spec>"                                       # A single spec
    yarn run e2e:docker yarn playwright test "packages/components/<name>" # Screenshot tests of one component in Docker, as CI runs them
    yarn run eslint --max-warnings=0 && yarn run stylelint --max-warnings=0 && yarn run prettier
    yarn run build:components && yarn run check-api # Public API golden files
    ```

    Screenshots differ between operating systems. Update the baselines only with `yarn run e2e:docker:update-snapshots`, or ask a maintainer to comment `/approve-snapshots` on the pull request. See [Testing](docs/guides/06-testing.md) for details, and [Linting](docs/guides/07-linting.md) for every lint check CI runs and how to fix it.

5. Open a pull request against `main`. Maintainers backport fixes from `main` to the older release lines (`20.4.x`, `19.x`, `18.x`) where they apply. Target a release branch directly only when the problem does not exist in `main`.

## Commit messages and pull request titles

commitlint checks the commit message in the `commit-msg` hook and the pull request title in CI. The rules are in the [commitlint config](.commitlintrc.js).

```
<type>(<scope>): <subject>
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` or `revert`.
- **scope** (optional): a directory name under `apps/` or `packages/components/` (`button`, `select`, `core`, `docs`), or one of the extra scopes listed in the config (`schematics`, `cli`, `e2e`, `examples`, `deps` and others). Separate several scopes with commas: `fix(datepicker,timepicker): ...`.
- **subject**: in the imperative mood, starting with a lowercase letter, with no period at the end.
- The header is at most 120 characters. Lines of the body and footer are at most 100 characters.
- Put the task reference at the end of the subject: `(#DS-1234)`. Link a GitHub issue in the pull request description with `Closes #123`.
- Mark a breaking change with `!` after the scope: `feat(select)!: ...`. A `BREAKING CHANGE:` paragraph in the pull request description works too, but only if it is there when the pull request is opened. What a breaking change ships with is listed in the [contribution checklist](docs/guides/01-contribution-checklist.md).

Examples:

```
feat(select): add multiline options input (#DS-3000)
fix(datepicker,timepicker): reject invalid text on paste (#DS-5803)
docs(core): hide keycodes from the API tab (#DS-5818)
```

Pull requests are squash-merged, and the pull request title becomes the commit message in `main`. A workflow labels the pull request by its title, and the release notes group changes by these labels: `feat` → Features, `fix` → Bug Fixes, `docs` → Documentation, `(deps)` → Dependencies, `!` → Breaking Changes. Labels are only added: after changing the type in the title, remove the old label by hand.

## Pull requests

- Fill in the [pull request template](.github/pull_request_template.md): a summary, the notable changes and what reviewers should focus on.
- Keep one change per pull request: it becomes one commit in `main`.
- Open unfinished work as a [draft](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests) and mark it **Ready for review** when it is done.
- Reviewers are requested automatically from [CODEOWNERS](.github/CODEOWNERS).
- Keep the branch up to date with `main`: a pull request with conflicts gets no CI runs at all.
- Pull requests from branches of this repository get a docs preview; pull requests from forks do not.

## Ready to merge

A maintainer squash-merges the pull request when:

- CI is green, including the commitlint check of the title;
- a code owner has approved it and the review threads are resolved;
- it has no conflicts with the target branch.

A branch of this repository is deleted automatically after the merge; a branch in a fork is not.
