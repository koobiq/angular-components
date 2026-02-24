### With default parameters

<!-- example(input-overview) -->

### Numeric input field

This is a special field for entering numbers only. You can type digits here, and the system will automatically format them in a user-friendly way (for example, adding thousands separators).

In cases where the thousands separator is a thin space, the input field includes logic to replace them when pasting from the clipboard, using the `kbqNormalizeWhitespace` directive. This behavior is not enabled by default — it is expected to be turned on manually when needed.

Number formatting depends on your chosen locale. This means the same number may look different depending on your regional settings.

<!-- example(input-number-overview) -->

### Password input

<!-- example(input-password-overview) -->

### Using input masks

Input masks control the format and validate data in real time.

The example uses the [Maskito](https://maskito.dev/) library:

```bash
npm install @maskito/core @maskito/angular @maskito/kit
```

<!-- example(input-with-mask) -->
