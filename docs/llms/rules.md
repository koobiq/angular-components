Rules for code that uses Koobiq:

- Import from the secondary entry points only, for example `import { KbqButtonModule } from '@koobiq/components/button'`: the root of the package exports nothing. Shared providers, tokens and utilities come from `@koobiq/components/core`.
- Start from the closest example of an item instead of guessing its inputs. The API section of the item lists every input and output; where the text of a page disagrees with it, the API section is right.
- Put text controls, such as `input[kbqInput]`, `textarea[kbqTextarea]` and `kbq-select`, inside `<kbq-form-field>`; their hints and errors go inside it too.
- Style with the `--kbq-*` design tokens and the `kbq-*` typography classes; never hard-code colors, sizes or fonts.
- Icons come from `@koobiq/icons` through `<i kbq-icon="kbq-..."></i>`; an icon-only button needs an accessible label.
- Do not use anything marked as deprecated in new code.
