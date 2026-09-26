<!-- covers: form-field, input, textarea, select, tree-select, timezone, autocomplete, tag-input, datepicker, timepicker, checkbox, radio, toggle, file-upload, core, button, dl, inline-edit -->

# Forms

Contents: Form field · Reactive form · When errors are shown · Required, disabled, read-only · Text, number, password,
textarea · Select, autocomplete, tags · Date and time · Checkbox, radio, toggle · File upload

## Form field

`<kbq-form-field>` wraps one control: `input[kbqInput]`, `input[kbqNumberInput]`, `input[kbqInputPassword]`,
`textarea[kbqTextarea]`, `<kbq-select>`, `<kbq-tree-select>`, `<kbq-timezone-select>`, `<kbq-tag-list>`,
`input[kbqDatepicker]`, `input[kbqTimepicker]` or an input with `[kbqAutocomplete]`; with none it throws
`kbq-form-field must contain a KbqFormFieldControl` (a missing directive or module import).

- Inside it: `<kbq-label>` (a `<label for>`; names `<kbq-select>` via `aria-labelledby`), `<kbq-hint>`, `<kbq-error>`
  (rendered only in the error state, above the hints), `kbqPrefix` / `kbqSuffix` attributes, `<kbq-cleaner />`,
  `<kbq-password-toggle />` (with `kbqInputPassword`), `<kbq-reactive-password-hint [hasError]>`, `<kbq-stepper />`
  (with `kbqNumberInput`). Hints and the shown error are linked through `aria-describedby` for you.
- The cleaner shows on a filled, enabled control. Next to a text control it calls `reset()` on the bound `formControl`
  or `ngModel` (`Esc` too), so a `nonNullable` control returns to its initial value; inside `<kbq-select>` or
  `<kbq-tag-list>` it clears all but disabled items.
- Import `KbqFormFieldModule` (`@koobiq/components/form-field`) for them. `KbqInputModule`, `KbqTextareaModule`,
  `KbqSelectModule`, `KbqTimepickerModule` and `KbqDatepickerModule` re-export it, `KbqAutocompleteModule` and
  `KbqTagsModule` do not.
- Inputs: `horizontal` (split with `labelClass="flex-35" contentClass="flex-65"`), `noBorders`; for all fields
  `kbqFormFieldDefaultOptionsProvider({ noBorders: true })`.
- `<kbq-fieldset>` joins fields (`<legend kbqLegend>`, `kbqFieldsetItem` on fields and buttons) and always renders its
  `<kbq-error>`, so wrap that in `@if`. Layout: `KbqFormsModule` (core), `kbq-form-vertical` or `kbq-form-horizontal`
  on `<form>`, then `kbq-form__fieldset`, `kbq-form__row`, `kbq-form__label`, `kbq-form__control`.

## Reactive form

```ts
import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqErrorStateMatcherProvider, ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    selector: 'app-user-form',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule, KbqButtonModule],
    providers: [kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <form [formGroup]="form" (ngSubmit)="submit()">
            <kbq-form-field>
                <kbq-label>Email</kbq-label>
                <input formControlName="email" kbqInput required />
                <kbq-hint>Work address</kbq-hint>
                <kbq-error>{{ form.controls.email.hasError('required') ? 'Required' : 'Invalid email' }}</kbq-error>
            </kbq-form-field>
            <button color="contrast" kbq-button type="submit">Save</button>
        </form>
    `
})
export class UserForm {
    protected readonly form = new FormGroup({
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
    });
    private readonly fields = viewChildren(KbqFormField);

    protected submit(): void {
        const fields = this.fields();

        // Error states update on the next change detection run, so look for the first invalid field after it.
        setTimeout(() => fields.find((field) => field.invalid)?.focus());
    }
}
```

## When errors are shown

- Validators decide what is invalid; `ErrorStateMatcher` (core) decides when a control shows it: red field,
  `aria-invalid`, its `<kbq-error>`. Default: invalid and (touched or form submitted).
- Built in: `ShowOnFormSubmitErrorStateMatcher` (after submit; needs a `[formGroup]` or `ngForm` parent),
  `ShowRequiredOnSubmitErrorStateMatcher` (`required` after submit, the rest once touched),
  `ShowOnControlDirtyErrorStateMatcher` (once dirty or submitted). Custom: a class with `isErrorState(control, form)`.
- Subtree: `providers: [kbqErrorStateMatcherProvider(ShowRequiredOnSubmitErrorStateMatcher)]`; one control:
  `[errorStateMatcher]="matcher"` (an instance) on `kbqInput`, `kbqInputPassword`, `kbqTextarea`, `<kbq-select>`,
  `kbqDatepicker`, `kbqTimepicker`, `<kbq-tag-list>`, `<kbq-file-upload>`.
- A `FormGroup` error (password confirmation, date range) marks no field unless you provide
  `kbqErrorStateMatcherProvider(new ShowOnCrossFieldErrorStateMatcher(scope, own?))`, an instance (the class throws
  `NG0204`). `scope(errorKey, errorValue)` names the controls concerned, or `null`; they turn red once all are touched
  or on submit; `own` keeps another matcher's timing for their own errors.
- Validation guide: never disable submit; after a failed submit focus the first invalid field; filter invalid
  characters while typing, check formats (email, IP) on blur and empty required fields on submit; no errors on open;
  put form-level errors in a focused alert above the first field, the only signal for "fill at least one of these".

## Required, disabled, read-only

- Required: `Validators.required` plus the `required` attribute. Controls do not read the flag from validators; it sets
  native `required` (`kbqInput`, `kbqInputPassword`, `kbqTextarea`, `kbqDatepicker`, `kbqTimepicker`) or
  `aria-required` (`<kbq-select>`). Mark optional fields when most are required ("Optional" placeholder or tag), else
  mark required ones (red asterisk after the label, or "Required" under the field); one method per form.
- Disabled: with a form directive disable the `FormControl` (`disable()`, `{ value, disabled: true }`); bind
  `[disabled]` only without one. Items: `<kbq-option [disabled]>`, `<kbq-optgroup [disabled]>`,
  `<kbq-radio-button [disabled]>`. The cleaner hides on a disabled control.
- Read-only: there is no `readonly` input or look. Show such values as text (`<kbq-dl>`) or in a disabled
  `<kbq-inline-edit>`, which renders static text.

## Text, number, password, textarea

- `kbqInput` and `kbqTextarea` trim string values before the model (the visible text stays; `no-trim` opts out);
  passwords are never trimmed. `kbqInput` throws on `checkbox`, `radio`, `file`, `range`, `hidden` and button types.
- Numbers: `<input kbqNumberInput [formControl]="amount" [min]="0" [max]="100" />` and `<kbq-stepper />`, not
  `type="number"`; `<kbq-cleaner>` throws there. Value `number | null`, displayed with locale separators; `min`/`max`
  bound stepping and add `min`/`max` errors; `step` (arrows), `bigStep` (Shift+arrows), `integer`,
  `withThousandSeparator`.
- Password: `<input kbqInputPassword>`, `<kbq-password-toggle />` and a `<kbq-reactive-password-hint [hasError]>` per
  `PasswordValidators` (core) rule: `minLength(n)`, `maxLength`, `minUppercase`, `minLowercase`, `minNumber`,
  `minSpecial` (error key = method name). `<kbq-password-hint>` and `PasswordRules` are deprecated.
- Textarea: `<textarea kbqTextarea>` grows with its content (`canGrow`, default `true`); `[maxRows]="5"` caps it.

## Select, autocomplete, tags

- Select: `<kbq-select formControlName="role">` with `<kbq-option [value]>` (groups: `<kbq-optgroup [label]>`). Put
  `<kbq-cleaner />` inside `<kbq-select>`, not beside it. `multiple` is fixed after init; its value is an array in
  option order (`sortComparator` reorders). Object values need `[compareWith]`. Search (over 10 options): a nested
  `<kbq-form-field kbqSelectSearch>` with an input plus `<div kbq-select-search-empty-result>`; filter the options
  yourself (`createSearchPredicate`, core). Without `<kbq-label>` set `aria-label`.
- Autocomplete: `<input kbqInput [formControl]="country" [kbqAutocomplete]="auto" />` and
  `<kbq-autocomplete #auto="kbqAutocomplete">` with `<kbq-option>` items, in one form field; import
  `KbqAutocompleteModule` and `KbqInputModule`. Filter the options from the control value; object values need
  `[displayWith]` on `<kbq-autocomplete>`.
- Tags: `<kbq-tag-list #tagList="kbqTagList" [formControl]="tags">` in a form field holds `<kbq-tag [value]>` items
  (`(removed)`, a `kbqTagRemove` icon inside), `<kbq-cleaner />` and
  `<input kbqInput [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="add($event)" />`. Validators go on the tag list
  control (an array), not the input's own control. Invalid tags are added too: filter them in `(kbqTagInputTokenEnd)`.

## Date and time

- Both need a `DateAdapter`, or they throw `No provider found for DateAdapter`: import `LuxonDateModule` from
  `@koobiq/angular-luxon-adapter/adapter` (install `@koobiq/luxon-date-adapter` and `luxon`) or `MomentDateModule` from
  `@koobiq/angular-moment-adapter/adapter`. Values are adapter dates (Luxon `DateTime`), not strings; create them with
  `inject(DateAdapter)` (`today()`, `createDate(year, monthFromZero, day)`).
- Datepicker, all in one form field: `<input [kbqDatepicker]="dp" [formControl]="date" [min]="min" [max]="max" />`,
  `<kbq-datepicker-toggle-icon kbqSuffix [for]="dp" />`, `<kbq-datepicker #dp [minDate]="min" [maxDate]="max" />`.
- `min`/`max` on the input validate typed and picked dates (`kbqDatepickerMin`, `kbqDatepickerMax`; the value still
  reaches the control); `minDate`/`maxDate` only restrict the calendar, so set both. Bounds keep the time: use the start
  of the first allowed day and the end of the last. Also `kbqDatepickerParse` (unparseable text) and
  `kbqDatepickerFilter` (rejected by `[kbqDatepickerFilter]`). No range widget: use two fields.
- Timepicker: `<input kbqTimepicker [format]="TimeFormats.HHmm" [formControl]="time" />` in a form field;
  `TimeFormats.HHmm` or `HHmmss`, from `@koobiq/components/timepicker`; 24-hour only. `[min]`/`[max]` give
  `kbqTimepickerLowerThenMin`/`kbqTimepickerHigherThenMax`; unparseable text gives `kbqTimepickerParse`.

## Checkbox, radio, toggle

- Not form-field controls: `<kbq-form-field>` around them throws. Bind the form control to `<kbq-checkbox>`,
  `<kbq-radio-group>` (never the buttons) or `<kbq-toggle>`; put a description in `<kbq-hint>` (`KbqFormFieldModule`).
- Checkbox: `boolean` value; `required` with a form directive means "must be checked" (`KbqCheckboxRequiredValidator`,
  error `required`). No group component: one control per box, a parent box driven by `[checked]` and `[indeterminate]`.
- Radio: `<kbq-radio-group formControlName="plan">` with `<kbq-radio-button [value]>`; over 7 options use a select.
  Toggle: applies a setting at once, so in a form saved by a button use a checkbox; `[loading]` while applying.
- They have no error state and ignore `ErrorStateMatcher`: bind `[color]="ThemePalette.Error"` (`ThemePalette`, core)
  on your own condition, on each `<kbq-radio-button>` of a group.

## File upload

- `<kbq-file-upload>`, or with `multiple` (`KbqFileUploadModule`, `@koobiq/components/file-upload`), stays outside
  `<kbq-form-field>` and renders projected `<kbq-hint>` (import `KbqFormFieldModule`) itself. Show errors as
  `<kbq-hint color="error">` under `@if (upload.invalid && form.controls.file.hasError('required'))`, `#upload` on it.
- Value: `KbqFileItem | null` (`{ file: File }`) when single, `KbqFileItem[]` when multiple. Validators (core):
  `Validators.required`, `FileValidators.maxFileSize(bytes)` (error `maxFileSize`),
  `FileValidators.isCorrectExtension(['.pdf', 'image/png'])` (error `fileExtensionMismatch`). `[accept]` filters only
  the system dialog; dropped files pass, so validate the type too.
- Per-file errors when multiple: validate each item from `(filesAdded)` (a `FormArray`, for one) and set `hasError` on
  the failing `KbqFileItem`. Disabled: no focus, no drop.

Details: `node_modules/@koobiq/components/agent-docs/components/<id>.md` for each component above (`form-field.md`,
`select.md`, `datepicker.md` and so on); `node_modules/@koobiq/components/agent-docs/other/validation.md` for the
validation guide.
