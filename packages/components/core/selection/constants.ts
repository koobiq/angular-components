// Declared locally rather than imported: `typeof ngDevMode` is the guard the build optimizer folds away,
// so the warning below leaves no trace in a production bundle.
declare const ngDevMode: boolean | undefined;

export enum MultipleMode {
    CHECKBOX = 'checkbox',
    KEYBOARD = 'keyboard'
}

/**
 * Values accepted by the `multiple` input of a selection list or tree.
 *
 * The bare string literals are spelled out next to {@link MultipleMode} because a static attribute reaches
 * the input as a plain string, which TypeScript does not consider assignable to a string enum.
 *
 * `''` is what a bare `multiple` attribute resolves to. `'single'`, `'false'` and `false` all turn multiple
 * selection off.
 */
export type KbqMultipleInput =
    MultipleMode | 'checkbox' | 'keyboard' | 'single' | 'true' | 'false' | '' | boolean | null | undefined;

/** Spellings of the checkbox mode, alongside `true`. */
const checkboxValues: string[] = [MultipleMode.CHECKBOX, 'true', ''];

/** Spellings that turn multiple selection off, alongside `false`, `null` and `undefined`. */
const singleValues: string[] = ['single', 'false'];

/**
 * Resolves the `multiple` input of a selection list or tree into a mode, or `null` for single selection.
 *
 * The set of modes is closed, so an unrecognized value falls back to single selection and is reported in dev
 * mode rather than read as multiple selection.
 */
export function resolveMultipleMode(value: KbqMultipleInput): MultipleMode | null {
    if (value === true) {
        return MultipleMode.CHECKBOX;
    }

    if (value === false || value == null) {
        return null;
    }

    if (value === MultipleMode.KEYBOARD) {
        return MultipleMode.KEYBOARD;
    }

    if (checkboxValues.includes(value)) {
        return MultipleMode.CHECKBOX;
    }

    if (!singleValues.includes(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        // eslint-disable-next-line no-console
        console.warn(
            `Unsupported \`multiple\` value ${JSON.stringify(value)}, falling back to single selection. ` +
                'Expected "checkbox", "keyboard", "single", an empty value or a boolean.'
        );
    }

    return null;
}
