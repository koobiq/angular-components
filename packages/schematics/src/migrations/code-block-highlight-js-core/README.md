# code-block-highlight-js-core

Migration schematic invoked automatically by `ng update @koobiq/components` (registered for `21.1.0-0`).
Keeps the full highlight.js bundle where the code block loaded it by default.

## Background

A highlight.js configuration without `core`, or no configuration at all, used to load the full bundle:
every language highlight.js has, about 1 MB. Since the library held `import('highlight.js')`, every
application bundled that chunk, even one whose configuration loaded the core and a few languages: a bundler
emits a chunk for each `import()` it finds, whether it is called or not.

The code block loads the core now, `highlight.js/lib/core`, which has no languages but plain text. The full
bundle is loaded only where the application asks for it:

```ts
kbqCodeBlockHighlightJsConfigProvider({ core: () => import('highlight.js') });
```

## What it rewrites

- An application that imports `@koobiq/components/code-block` and has no highlight.js configuration in its
  root providers gets the provider above there, through `addRootProvider`, standalone or NgModule.
- A configuration written as an object literal without `core` - the argument of
  `kbqCodeBlockHighlightJsConfigProvider` and the `useValue` of a `KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG`
  provider, imported under another name or passed to `TestBed.overrideProvider` too - gets
  `core: () => import('highlight.js')`, in specs too.

## What it does _not_ do

| Case                                                             | Manual migration                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| A configuration in a variable, with a spread or from a factory   | Add `core: () => import('highlight.js')` if it has no `core`                         |
| A configuration the root providers get through a function        | Remove the added root provider, which overrides it                                   |
| A library that renders code blocks                               | Provide a configuration in the applications that use it                              |
| A bootstrap it cannot analyze, or root providers not in an array | Add the provider to the root providers by hand                                       |
| A spec that checks the highlighted markup of a code block        | Add the configuration to its `TestBed`: specs do not get the application's providers |

To drop the full bundle, about 1 MB, list the languages the files use instead; plain text needs no entry:

```ts
kbqCodeBlockHighlightJsConfigProvider({
    languages: {
        typescript: () => import('highlight.js/lib/languages/typescript')
    }
});
```

## Running it manually

```
ng generate @koobiq/components:code-block-highlight-js-core --project my-app
```
