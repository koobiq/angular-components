export function getKbqInputUnsupportedTypeError(inputType: string): Error {
    return Error(`Input type "${inputType}" isn't supported by kbqInput.`);
}

/**
 * Logged when `kbqNumberInput` sits on a native number field, which the directive resets to `text`.
 */
export const KBQ_NUMBER_INPUT_UNSUPPORTED_TYPE_MESSAGE =
    'Input type "number" isn\'t supported by kbqNumberInput: the native value sanitizer rejects the ' +
    'formatted value, blanking the field. The type has been reset to "text".';
