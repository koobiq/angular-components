### Deprecated Icons schematics

This schematic provides migration away from the deprecated `pt-icons` scope. It includes:

- Change the `pt-icons` scope/prefix to `kbq` in `class` attributes, `kbq-icon`/`kbq-icon-item`/`kbq-icon-button`
  attribute values, `[class.pt-icons-*]` bindings, and bare string literals — for TS, HTML, and styles
- Update icon names for deprecated icons according to [mapping](data.ts)
- Fix icons package prefix in styles

Matching is AST-based (parsed HTML/TypeScript, not whole-file text search), so it only touches genuine icon
usages — e.g. a component selector, a `[class]` binding expression, or an unrelated class/variable that merely
contains the substring `pt-icons` is left alone. It also covers a component's inline `host` class bindings and
inline `styles` array, and icons inside ICU expansions (`{count, plural, ...}`). A bound attribute value that
isn't a single quoted literal (a dynamic expression, a concatenation, or `{{ }}` interpolation) can't be
resolved statically — it's reported as a warning rather than migrated or silently corrupted. An icon whose
scope prefix was already swapped to `kbq-` by an earlier run (e.g. `kbq-icon="kbq-add-to-list_16"`) still gets
its name corrected.

One documented exception: in style files there's no CSS/SCSS parser, so token matching is a
word/selector-boundary-safe regex rather than real selector parsing — this correctly ignores
`.my-widget-pt-icons-preview`, `$pt-icons`, and `@import 'pt-icons'` (the bare scope word only matches when
directly preceded by `.`, like a real class selector), but a genuine selector spelled out inside a comment is
still indistinguishable from one that isn't and can still be rewritten.

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
