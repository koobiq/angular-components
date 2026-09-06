Input provides text, numeric, and password fields with formatting, validation, masking, and other data-entry behavior.

### With default parameters

<!-- example(input-overview) -->

### Numeric input field

This is a special field for entering numbers only. You can type digits here, and the system will automatically format them in a user-friendly way (for example, adding thousands separators).

In cases where the thousands separator is a thin space, the input field includes logic to replace them when pasting from the clipboard, using the `kbqNormalizeWhitespace` directive. This behavior is not enabled by default — it is expected to be turned on manually when needed.

Number formatting depends on your chosen locale. This means the same number may look different depending on your regional settings.

<!-- example(input-number-overview) -->

#### Numeric input API

`kbqNumberInput` accepts the bounds and the step it applies, plus the formatting switches:

- `min` / `max` — the range the value is clamped to when stepping. Default `-Infinity` / `Infinity`. Both accept a static attribute (`min="3"`) and a binding (`[min]="3"`); the value is coerced to a number either way.
- `step` — the amount added by `ArrowUp`/`ArrowDown` and by `kbq-stepper`. Default `1`.
- `bigStep` — the amount added when `Shift` is held. Default `10`. Also readable as the `big-step` attribute.
- `integer` — rejects the fraction separator on typing and truncates a pasted fraction. Default `false`.
- `withThousandSeparator` — groups the integer part with the locale's separator. Default `true`.
- `startFormattingFrom` — grouping only kicks in from this power of ten, so `3` groups `1234` and `4` does not. Defaults to the active locale's own value (`4` for `ru-RU`), which is why a four-digit number stays un-grouped there.

The directive renders into a `type="text"` field. Do not add `type="number"`: the browser's value sanitizer rejects the formatted value and blanks the field, so the type is reset to `text` with a console warning.

`min` and `max` also drive the `KbqMinValidator` / `KbqMaxValidator` directives shipped in `KbqInputModule`, which install `Validators.min` / `Validators.max` on any `formControl`, `formControlName` or `ngModel` control carrying the corresponding attribute, and mirror the bound value into the native `min` / `max` attribute.

`checkRules()` on `kbqInputPassword` re-runs every `kbq-password-hint` in the form field against the current value — call it after changing a rule at runtime.

#### Number formatting and locale

Separators come from the active locale, through the `input.number` section of its configuration. Override them for a subtree with `kbqNumberInputLocaleConfigurationProvider({ number: { fractionSeparator: '.' } })`; only the keys you pass are replaced, the rest keep following the locale. `KBQ_NUMBER_INPUT_DEFAULT_CONFIGURATION` holds the `ru-RU` defaults.

### Monospace input

`kbqInputMonospace` switches a `kbqInput` to the monospace type level — useful for identifiers, hashes and keys.

### Password input

<!-- example(input-password-overview) -->

### Using input masks

Input masks control the format and validate data in real time.

The example uses the [Maskito](https://maskito.dev/) library:

```bash
npm install @maskito/core @maskito/angular @maskito/kit
```

<!-- example(input-with-mask) -->
