/**
 * Data for the `code-block-optional-max-height` migration.
 *
 * `KbqCodeBlock.maxHeight` was published as `InputSignal<number>` over an `undefined!` default, so a code
 * block with no `[maxHeight]` binding reported `undefined` from a non-nullable type:
 *
 * ```ts
 * const height: number = codeBlock.maxHeight(); // held undefined
 * if (codeBlock.maxHeight() > 0) { … }          // NaN comparison, never true
 * ```
 *
 * It reports `number | undefined` now. Nothing about the runtime value changed — the call sites that were
 * already wrong now fail to compile.
 *
 * `KbqCodeBlockHighlight.file` was a write-only required input (a setter with no getter) that kicked off
 * highlighting as a side effect. It is `input.required()` driven by an effect now, so it can finally be read
 * — and a programmatic write no longer compiles.
 *
 * Warn-only. Narrowing `number | undefined` back to `number` is a decision the call site owns, and a `file`
 * write has to become a binding.
 */

/** Import specifier that marks a file as a code block consumer. */
export const CODE_BLOCK_PACKAGE = '@koobiq/components/code-block';

/** Identifier shape that marks a consumer without an import (e.g. a re-export or a subclass). */
export const CODE_BLOCK_TYPE = '\\bKbqCodeBlock\\b';

/** Identifier shape that marks a consumer of the highlight directive. */
export const HIGHLIGHT_TYPE = '\\bKbqCodeBlockHighlight\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: CODE_BLOCK_TYPE,
        pattern: '\\.\\s*maxHeight\\b',
        message:
            'KbqCodeBlock.maxHeight reports `number | undefined` instead of `number`. It was declared ' +
            'non-nullable over an `undefined!` default, so a code block with no [maxHeight] binding always ' +
            'returned `undefined` behind a `number` type — an assignment to a `number` held `undefined`, and ' +
            'any arithmetic on it produced NaN. Decide per call site: `?? 0`, or handle the unset state.'
    },
    {
        anchor: HIGHLIGHT_TYPE,
        pattern: '\\.\\s*file\\s*=[^=]',
        message:
            'KbqCodeBlockHighlight.file was a write-only required input (a setter with no getter) that started ' +
            'highlighting as a side effect. It is a required signal input driven by an effect now, so the ' +
            'write no longer compiles — bind [file] instead. In exchange, it can finally be read: `file()`.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The `max-height` the code block applies while `viewAll` is off is a computed now. It was a getter read ' +
        'from a `[style.max-height.px]` binding, which only re-evaluated when something else marked the view ' +
        'dirty; it follows `maxHeight` and `viewAll` directly.',
    '  `softWrap`, `viewAll`, `canDownload`, `activeFileIndex` and `files` are backed by signals. They are ' +
        'still accessor inputs with the same types and the same two-way outputs, so no call site changes — ' +
        'but a template that reads them now re-renders on its own rather than waiting for change detection.'
];
