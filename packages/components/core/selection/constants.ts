import { KbqEnumValues } from '../utils';

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
 * `KbqEnumValues` accepts a mode either as a {@link MultipleMode} member or as the plain string a static
 * attribute delivers, and follows the enum on its own. The remaining literals are the spellings that are not
 * modes: `''` is what a bare `multiple` attribute resolves to, and `'single'`, `'false'` and `false` all turn
 * multiple selection off.
 */
export type KbqMultipleInput =
    KbqEnumValues<MultipleMode> | 'single' | 'true' | 'false' | '' | boolean | null | undefined;

/** Every mode the enum declares, so adding one needs no change here. */
const modes: string[] = Object.values(MultipleMode);

/** Spellings that mean the default multiple mode, alongside `true`. */
const checkboxAliases: string[] = ['', 'true'];

/** Spellings that turn multiple selection off, alongside `false`, `null` and `undefined`. */
const singleAliases: string[] = ['single', 'false'];

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

    if (modes.includes(value)) {
        return value as MultipleMode;
    }

    if (checkboxAliases.includes(value)) {
        return MultipleMode.CHECKBOX;
    }

    if (!singleAliases.includes(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        // eslint-disable-next-line no-console
        console.warn(
            `Unsupported \`multiple\` value ${JSON.stringify(value)}, falling back to single selection. ` +
                `Expected ${modes.map((mode) => `"${mode}"`).join(', ')}, "single", an empty value or a boolean.`
        );
    }

    return null;
}
