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

/**
 * Shapes that mark a file as a code block consumer. `KbqCodeBlock` alone would miss every real call site:
 * a template reference read (`#b="kbqCodeBlock"`) lives in a file that names the module or the element,
 * never the component class.
 */
export const CODE_BLOCK_TYPE = '\\bKbqCodeBlock\\w*\\b|kbq-code-block|\\bkbqCodeBlock\\b';

/** Identifier shape that marks a consumer of the highlight directive, in TypeScript or in a template. */
export const HIGHLIGHT_TYPE = '\\bKbqCodeBlockHighlight\\b|\\bkbqCodeBlockHighlight\\b';

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
    '  `softWrap`, `viewAll`, `canDownload`, `activeFileIndex` and `files` are backed by signals now. They ' +
        'keep the same types and the same two-way outputs, so no call site changes, but four of them were ' +
        'plain public fields and are accessors now: they no longer appear in `Object.keys`, a spread or ' +
        '`JSON.stringify`, and a subclass field of the same name shadows the accessor under ' +
        '`useDefineForClassFields`.',
    '  `hideTabs` is derived rather than written. A single file with no filename still hides the tab bar, ' +
        'but the component no longer writes `true` into its own input to do it: the write latched the bar ' +
        'off for good, so naming the files later never brought it back, and it re-emitted `hideTabsChange` ' +
        'on every `files` assignment. `[hideTabs]="false"` no longer shows the bar for a lone unnamed file.',
    '  An `activeFileIndex` outside `files` renders the first file instead of the indexed one, and an empty ' +
        '`files` renders no code at all. Both used to reach `files[activeFileIndex]` and throw on the ' +
        'undefined result. The index itself is left alone: resetting it wrote back into `[(activeFileIndex)]` ' +
        'while the parent was still updating.'
];
