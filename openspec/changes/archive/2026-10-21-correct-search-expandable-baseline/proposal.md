# Proposal

## Why

The baseline spec of `search-expandable` (`openspec/specs/search-expandable/spec.md`, written from the code on `c9c196a9b` and never checked) states behaviour the code does not have. A static audit of every requirement against `packages/components/search-expandable`, the parts of `core`, `input`, `button` and `@angular/forms` it relies on, and their tests found six requirements with at least one wrong statement; this change corrects them so the spec describes what ships.

## What Changes

- **isOpenedChange reports changes made by the component**: a non-empty initial model value is a model-value expansion and emits `true` during the first render (`[formControl]`, `[formControlName]`) or right after it (`ngModel`); only a first render that starts collapsed or is expanded by `[isOpened]` emits nothing.
- **Expanding moves focus into the input**: focus moves only for an enabled component; an expansion through `[isOpened]` while disabled leaves the disabled input unfocused.
- **Collapsing moves focus to the collapsed button**: the rule holds only for an enabled component, since a disabled collapsed button does not take focus; the focus origin is the one of the last focus inside the component only while focus is still inside it, otherwise none is passed and the CDK `FocusMonitor` attributes the focus itself.
- **A model value expands the field**: on the first binding of a reactive form directive the forms API writes the value before it reports the disabled state, so a control disabled from the start, or `[disabled]` set on the first render, does not keep a non-empty initial value from expanding the field.
- **The value signal mirrors the field**: a write into `value` reaches the field when the component's effects next run, at the next change detection, not at once; the debounce towards the bound control starts from there.
- **Error state follows the bound control**: the error state is re-evaluated only when the component's own view is checked, so a submit or a `markAsTouched()` made outside the component shows the error only at the next such check.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `search-expandable`: six requirements corrected to match the code: isOpenedChange reports changes made by the component, Expanding moves focus into the input, Collapsing moves focus to the collapsed button, A model value expands the field, The value signal mirrors the field and Error state follows the bound control.

## Impact

Only OpenSpec files: this change and, once archived, `openspec/specs/search-expandable/spec.md`. No source, test or documentation file changes.
