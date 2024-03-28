export function getKbqInputUnsupportedTypeError(inputType: string): Error {
    return Error(`Input type "${inputType}" isn't supported by kbqInput.`);
}
