### Button Supported Colors schematics

This schematic migrates consumers to the narrowed button color set. It includes:

- Removing a `color` written as a literal outside the supported set from `[kbq-button]`, `kbq-button-group`,
  `[kbqButtonGroupRoot]` and `kbq-split-button` hosts
- Reporting the `color` bindings it cannot resolve, and the members still typed `KbqComponentColors` /
  `ThemePalette`
- Reporting stylesheets that target the old default color of a transparent button
- A note about the behaviour changes that have no textual signature to search for

#### Why

`color` used to accept any `KbqComponentColors` / `ThemePalette` value, but `kbq-button-theme()` only ever
styled the pairs the design system defines:

| `kbqStyle`    | supported colors              |
| ------------- | ----------------------------- |
| `filled`      | `contrast`, `contrast-fade`   |
| `outline`     | `theme-fade`, `contrast-fade` |
| `transparent` | `theme`, `contrast`           |

Every other combination matched no rule at all, so the button fell through to the user-agent appearance — a
grey OS button. The most visible case was `transparent` with no explicit color: the shared default was
`contrast-fade`, which is not one of the two colors the transparent block styled.

Each style now carries its own default color, every style gained an unqualified fallback rule, and `color` was
narrowed to the four colors a button supports.

#### What is fixed

A `color` written as a literal — `color="error"`, `[color]="'error'"`, `bind-color="'error'"` — and holding one
of `error`, `warning`, `success`, `empty`, `primary`, `secondary`, `info` is removed.

This is appearance-preserving. The button already rendered in its style's default color: an unsupported color
matched no theme rule, and the fallback rule added by this release resolves to exactly the tokens the style's
default color branch resolves to. Removing the binding only drops a value that never had an effect, and fixes
the type error.

#### What is reported, not fixed

| Case                                                 | Why                                                                                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `[color]="colors.Error"`                             | the expression is not resolved, so the member name alone does not prove which enum it comes from — deleting it blind could change colors |
| `button.color = KbqComponentColors.Error`            | same, on the programmatic path                                                                                                           |
| `kbqOkType`                                          | narrowed from `string` to `KbqButtonColor` on `KbqModalComponent` and `ModalOptions`                                                     |
| a member typed `KbqComponentColors` / `ThemePalette` | the wide type no longer assigns to a button `color` binding                                                                              |
| `.kbq-button_transparent.kbq-contrast-fade`          | no longer matches — a transparent button defaults to `contrast` now                                                                      |

Watch for values built inside `Array.from` / `map` callbacks: without a return-type annotation an enum member
widens to the whole enum and stops assigning even when every value is supported. Annotate the callback:

```ts
Array.from({ length: 3 }, (_, i): ExampleAction => ({ color: KbqComponentColors.ContrastFade, ... }))
```

#### Behaviour changes with no textual signature

- A transparent button with no explicit color renders in `contrast` instead of `contrast-fade`. It used to
  match no theme rule and rendered as a native button, so this is the fix — but a stylesheet or a `color`
  getter read that expected `contrast-fade` needs updating.
- A style paired with a color the design system does not define now renders in the style default instead of
  unstyled.
- `KbqButtonGroupRoot` no longer propagates a color it was never given, so each nested button follows the
  default color of its own style. A color bound on the group still wins over that default.

#### Usage

```bash
ng generate @koobiq/components/schematics:button-supported-colors
```

Pass `--fix=false` to print what would change without writing.
