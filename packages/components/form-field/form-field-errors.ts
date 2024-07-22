export function getKbqFormFieldMissingControlError(): Error {
    return Error('kbq-form-field must contain a KbqFormFieldControl.');
}

export function getKbqFormFieldYouCanNotUseCleanerInNumberInputError(): Error {
    return Error(`You can't use kbq-cleaner with input that have type="number"`);
}
