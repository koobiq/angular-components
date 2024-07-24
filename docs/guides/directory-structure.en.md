The top-level directory structure:

```
├─ docs ····················· Project documentation & guides
├─ scripts ·················· Public sh scripts
├─ packages ················· Public packages & source code for components
├─ tests ···················· Configs for tests
├─ tools ···················· infrastructure/build scripts
├─ commitlint.config.js ····· scope-enum declaration
├─ gulpfile.js ·············· Gulp tasks config
└─ package.json ············· Project config
```

### packages

```
├─ cdk ················· component development kit
├─ components ·········· component source code
├─ components-dev ······ dev examples
└─ docs-examples ······· examples for documentation
```

#### @koobiq/button

```
└─ button ···························· component name
    ├─ _button-base.scss ············· Base styles for component (include to button.scss)
    ├─ _button-theme.scss ············ Theme & typography styles (include to _all-themes & _all-typography)
    ├─ button.component.html ········· Component template
    ├─ button.component.spec.ts
    ├─ button.component.ts
    ├─ button.md ····················· Documentation for component
    ├─ button.module.ts
    ├─ button.scss ··················· Main styles (inline to component)
    ├─ index.ts ······················ Main entry point
    ├─ public-api.ts ················· Public exports
    ├─ README.md
    └─ tsconfig.build.json
```
