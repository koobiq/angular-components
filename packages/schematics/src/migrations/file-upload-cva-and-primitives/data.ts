/**
 * Data for the `file-upload-cva-and-primitives` migration.
 *
 * The file-upload review repaired the two contracts the component is judged on — the form contract
 * and the file-list primitive — and both changes are behavioral, so nothing here is rewritten:
 *
 * - `writeValue()` no longer routes through the `file`/`files` setters, so a programmatic value stops
 *   marking the control dirty, stops emitting `valueChanges` twice, and no longer fires
 *   `(fileChange)`/`(filesChange)`.
 * - `KbqFileList.remove()` now does what its JSDoc always said: removes the first occurrence, returns
 *   the removed item, and emits `itemRemoved`. It used to return the items it kept and remove every
 *   occurrence silently.
 * - The single uploader's hidden input is no longer `multiple`, so the system dialog cannot select
 *   files the component would discard; whatever a drop hands over past the first file is reported
 *   through the new `(rejected)` output.
 * - `KbqMultipleFileUploadComponent.hasFocus` is removed — it was public and read by nothing.
 *
 * Warn-only: which value a call site wanted from `remove()` and whether a consumer relied on the
 * output firing for a programmatic write are decisions, not renames.
 */

/** Import specifier that marks a file as a file-upload consumer. */
export const FILE_UPLOAD_PACKAGE = '@koobiq/components/file-upload';

/** Identifier and element shapes that mark a consumer without an import. */
export const FILE_UPLOAD_TYPE =
    '\\bKbq\\w*File(?:Upload|List|Loader|Multiple)\\w*\\b|\\bkbq-(?:single-|multiple-)?file-upload\\b';

export interface WarnPattern {
    /** The call sites the change breaks. Only evaluated for files the outer filter kept. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\.\\s*remove\\s*\\(',
        message:
            'KbqFileList.remove() follows its documented contract now: it removes the first occurrence, ' +
            'returns the removed item and emits itemRemoved. It used to return the items it kept, drop ' +
            'every occurrence and emit nothing, so a call site reading the return value gets the ' +
            'opposite array from before. Use removeAt(index) when you mean a position.'
    },
    {
        pattern: '\\.\\s*hasFocus\\b',
        message:
            'KbqMultipleFileUploadComponent.hasFocus was removed. It was public, always false and read ' +
            'by nothing; track focus with cdkMonitorSubtreeFocus or a (focusin)/(focusout) pair.'
    },
    {
        pattern: '\\((?:fileChange|filesChange)\\)|\\.\\s*(?:fileChange|filesChange)\\s*\\.\\s*subscribe',
        message:
            'writeValue() no longer emits (fileChange)/(filesChange). The outputs report a user picking ' +
            'or removing a file; a setValue/patchValue/reset from the host no longer looks like one. A ' +
            'handler that started an upload from there also ran on every programmatic write — subscribe ' +
            'to the control instead if that was the intent.'
    },
    {
        pattern: '\\bKbqInputFileMultipleLabel\\b',
        message:
            'KbqInputFileMultipleLabel is deprecated in favour of KbqMultipleFileUploadLocaleConfiguration. ' +
            'Its index signature only widened the config so an unknown key could be passed to ' +
            '[localeConfig], and nothing reads one.'
    },
    {
        pattern: '<\\s*kbq-single-file-upload\\b[^>]*\\bmultiple\\b',
        message:
            'kbq-single-file-upload no longer forwards `multiple` to its hidden input. It used to put the ' +
            'system dialog back into multi-select on a component that keeps one file and discarded the ' +
            'rest; remove the attribute, or use kbq-multiple-file-upload if several files were intended.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  A programmatic value no longer marks the control dirty. `control.setValue(...)` emits valueChanges ' +
        'once instead of twice, and a control reset right after `markAsPristine()` stays pristine — error ' +
        'display keyed off `dirty` shows fewer errors than before, not more.',
    '  The control is marked touched when focus leaves the uploader, so the default ErrorStateMatcher ' +
        'shows a `required` error to a user who tabbed through without attaching anything.',
    '  The single uploader renders a single-selection file input. The system dialog no longer offers a ' +
        'multi-selection the component would throw away; files a drop hands over past the first are ' +
        'reported through the new (rejected) output, as are duplicates skipped by the multiple uploader.',
    '  `accept` is documented as what it is — the native attribute, which only filters the system dialog. ' +
        'Rejection still needs a validator; FileValidators.isCorrectExtension takes the same array.',
    '  The locale gains a `fileUpload.a11y` section with the live-region announcements. A hand-written ' +
        'KbqLocaleData registered through KBQ_LOCALE_DATA has to add those three keys.',
    '  22 --kbq-file-upload-* custom properties that no rule read were removed, including both ' +
        '*-states-focused-focus-outline-color tokens. Setting one never had an effect.',
    '  KbqFileList.removeAt(index) ignores an index outside the list. It used to rewrite the list with a ' +
        'fresh array anyway — waking every list() consumer for a no-op — and emit itemRemoved carrying ' +
        'undefined in a tuple typed [T, number].',
    '  A drop that hands over no files (an empty directory unwraps to zero) no longer reaches the list. ' +
        'Under addStrategy="replace" it used to clear a selection the user had already built.',
    '  The public surface names KbqBaseFileUploadLocaleConfiguration / ' +
        'KbqMultipleFileUploadLocaleConfiguration where it used to name the deprecated *LocaleConfig ' +
        'aliases. The aliases still resolve to the same types, so no call site has to change.'
];
