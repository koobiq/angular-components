# Koobiq Terminal Interface

🚧 WIP. This feature is not stable yet. 🚧

# Usage

```bash
npm i --save-dev @koobiq/cli
```

## `Release` command

### stage-commit

```bash
npx koobiq-cli stage-commit
```

### Publish Gitlab CI

```bash
npx koobiq-cli publish-ci-gitlab
```

## Reading release notes in your own scripts

If you just want the release notes for a version — for example, to post a release announcement
somewhere — you don't need the full CLI.

`@koobiq/cli/release` reads them straight out of your project's `CHANGELOG.md` file:

```ts
import { extractReleaseNotes } from '@koobiq/cli/release';

const notes = extractReleaseNotes('./CHANGELOG.md', '1.2.3');
```

## Use npm pack to test packages locally

Build Package

```bash
npm run build:cli
```

Pack your artifacts

```bash
cd dist/cli
npm pack --pack-destination ~
```

Point package.json to file

```bash
"dependencies": {
  "@koobiq/cli": "file:~/koobiq-cli-16.0.0.tgz"
}

npm install
```
