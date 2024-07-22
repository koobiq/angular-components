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
