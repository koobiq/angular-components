### Deprecated Icons schematics

This schematic provides migration away from the deprecated `pt-icons` scope. It includes:

- Change the `pt-icons` scope/prefix to `kbq` in `class` attributes, `kbq-icon`/`kbq-icon-item`/`kbq-icon-button`
  attribute values, `[class.pt-icons-*]` bindings, and bare string literals — for TS, HTML, and styles
- Update icon names for deprecated icons according to [mapping](data.ts)
- Fix icons package prefix in styles

Matching is AST-based (parsed HTML/TypeScript, not whole-file text search), so it only touches genuine icon
usages — e.g. a component selector or an unrelated class that merely contains the substring `pt-icons` is left
alone. One documented exception: in style files there's no CSS/SCSS parser, so a bare `pt-icons`/`kbq` scope
word is matched by a word-boundary-safe regex rather than real selector parsing — this correctly ignores
`.my-widget-pt-icons-preview`, but can't distinguish a selector from the same word appearing inside a comment.

Two intentional behavior changes from earlier versions of this schematic:

- `class="pt-icons"` (the sole class) now becomes `class=""` rather than removing the `class` attribute
  entirely.
- A bare string literal like `'pt-icons word-wrap_16'` now also renames the icon suffix (e.g. to
  `'wrap-text_16'`), instead of only stripping the scope word.

`fix: false` (the default) never mutates any file — it only reports what it found.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:deprecated-icons --fix=true --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:deprecated-icons --fix=true --project <your project>
```
