# Testing

## Unit tests

We are using [Jest](https://github.com/jestjs/jest).

Runs tests for package

```bash
ng test components
```

Runs specific spec file

```bash
yarn jest packages/components/alert/alert.component.spec.ts
```

Runs specific test closure (`it`)

```bash
yarn jest packages/components/alert/alert.component.spec.ts --testNamePattern='should add class'
```
