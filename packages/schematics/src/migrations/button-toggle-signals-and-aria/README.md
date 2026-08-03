# button-toggle-signals-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Migrates consumers of the v20.3.0 button-toggle
review.

## Background

The review of `kbq-button-toggle` changed two unrelated things, which is why one
schematic covers both:

1. **ARIA, tab order and the keyboard.** The control always behaved like a radio
   group in single selection and like a set of toggle buttons with `multiple`,
   and none of it reached assistive tech: selection was readable from the
   `.kbq-selected` class alone. A single-selection group is now a `radiogroup` of
   `role="radio"` buttons with `aria-checked`, walked with the arrow keys and
   entered through a single tab stop; a `multiple` group is a `group` of toggle
   buttons with `aria-pressed`, each still its own tab stop.
2. **Signal inputs.** `vertical` and `multiple` moved from `@Input()`
   getter/setter pairs to `input()`.

Only the second breaks compilation. The first changes rendered markup and
behaviour, which no rewrite can carry over, so it is reported instead.

## What it does

The schematic walks every `.ts`, `.html`, `.scss`, `.css` and `.less` file in the
project (skipping `node_modules` and `dist`). A `.ts` file is inspected only if it
names a `KbqButtonToggle*` symbol, imports `@koobiq/components/button-toggle` or
mentions `kbq-button-toggle`; a stylesheet only if it mentions
`kbq-button-toggle`.

| Auto-fix                | Where                                            |
| ----------------------- | ------------------------------------------------ |
| `group.vertical` → `()` | `.ts` on a `KbqButtonToggleGroup`-typed receiver |
| `group.multiple` → `()` | `.ts` on a `KbqButtonToggleGroup`-typed receiver |
| `ref.vertical` → `()`   | templates, through `#ref="kbqButtonToggleGroup"` |
| `ref.multiple` → `()`   | templates, through `#ref="kbqButtonToggleGroup"` |

Receivers are resolved **within the file**, with no cross-file type resolution.
Covered: method and function parameters, class fields, constructor
parameter-properties and locals — by explicit type annotation, by an import under
an alias (`KbqButtonToggleGroup as Group`), or by a `viewChild()` /
`viewChild.required()` / `contentChild()` / `inject()` initialiser, where the
signal form is reached through its call (`this.group().multiple`). Not covered:
a receiver whose type comes from another file (`const g = this.group; g.multiple`,
an imported const) — those are reported instead of being rewritten.

Resolution is lexical: every declaration of a name is collected, not only the
button-toggle-typed ones, and the innermost scope containing the access wins. A
nested `const group = { vertical: 'north' }` therefore shadows an outer
`KbqButtonToggleGroup` of the same name and is left alone, which matters most in
spec files, where a `describe` often reuses short names.

Template reference variables are matched through the `exportAs`, in external
`.html` files and in inline `@Component({ template })` strings alike, with
whitespace around the dot tolerated (`group . multiple`, or a binding wrapped
over two lines) and preserved by the rewrite.

Every rewrite is idempotent: an access that is already a call, or is followed by
`.set` / `.update` / `.asReadonly` / `.subscribe`, is left alone.

## What it reports

**Assignments to `vertical` / `multiple`.** An `input()` is read-only and has no
`.set()`, so there is nothing to rewrite to — bind the input in the template and
drive the bound value instead.

**Members that were removed or narrowed**, found on a typed receiver:

| Member                                 | Why                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `KbqButtonToggle.mcButton`             | removed — a dead view query with a legacy prefix; use `focus()` / `focusViaKeyboard()`     |
| `KbqButtonToggle.buttonToggleGroup`    | `protected`, and typed `KbqButtonToggleGroup \| null` — it was non-null while being `null` |
| `KbqButtonToggle.icons`                | private — read the resulting `iconType` instead                                            |
| `KbqButtonToggle.iconType`             | read-only getter — reported on assignment only, a read still reads the same                |
| `KbqButtonToggle.type`                 | read-only getter that follows `multiple` at runtime — reported on assignment only          |
| `KbqButtonToggleGroup.selected`        | typed `KbqButtonToggle \| KbqButtonToggle[] \| null` instead of `any`                      |
| `KbqButtonToggleGroup.emitChangeEvent` | takes the toggle the change came from: `emitChangeEvent(toggle)`                           |

**Reads it could not resolve.** A `vertical` / `multiple` read on a receiver that
is not declared in the file — an imported const, an alias assigned from somewhere
else — is reported once per file, since a single-file pass cannot tell whether it
is a group.

**Icon-only toggles with no accessible name.** The template is parsed and every
`<kbq-button-toggle>` whose content holds an icon and no text at all is reported
with its line number, unless it carries `aria-label` or `aria-labelledby` (bound
or static, `[attr.]`-prefixed or not). A `title` does not count: it stays on
`<kbq-button-toggle>`, while the accessible name is computed for the inner
`<button>`, and the attribute never reaches it. An icon glyph is `aria-hidden`, so
such a button is announced as unlabelled — an AXE `button-name` failure — and the
component now logs a dev-mode warning about it. `aria-label` and `aria-labelledby`
are inputs of the toggle and are forwarded to the inner button, so the fix is one
attribute; the schematic cannot invent the text.

**Patterns worth a second look**, in files that already reference the
button-toggle: anything mentioning `tabindex` (the tab order of a single-selection
group is one stop now), a leftover `mcButton`, and manual `markForCheck()` calls
(inert now that a toggle derives its state from signals).

**Stylesheets** that copied the old theme selector `& > .kbq-icon-button`, a class
`KbqButton` never emitted — it is `.kbq-button-icon` now — or that override the
keyboard-focus `border-color`, which the theme owns alone since the structural
stylesheet stopped declaring it.

## What it cannot see

Printed once per run, because no call site points at it:

- the rendered `role` / `aria-checked` / `aria-pressed` and the group's
  `aria-orientation`, which snapshot and DOM-query tests will notice;
- arrow keys moving focus and selection together and `Home`/`End` jumping to the
  ends, with the keydown `preventDefault`-ed;
- naming the group with a plain `aria-label` / `aria-labelledby` attribute, which
  it had no role to be announced against before;
- `disabled` on a standalone toggle finally returning a `boolean` instead of the
  `null` group it could not find;
- `tabIndex` defaulting to `null` instead of `undefined`;
- the group implementing `OnDestroy`, so tearing down a whole selected group no
  longer emits `valueChange` after destruction;
- `onTouched` / `registerOnTouched` taking `() => void`, and
  `KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR` being typed `Provider`.

## Usage

```bash
ng update @koobiq/components@20
```

Or manually, for a project that is already on 20.3.0:

```bash
ng g @koobiq/components:button-toggle-signals-and-aria --project <your project>
```

Add `--fix=false` to print what would change without writing anything.
