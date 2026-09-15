/**
 * Data for the `dl-attribute-coercion` migration.
 *
 * `KbqDlComponent` was already fully signal-based; the review found the five inputs that never got a
 * coercion transform, so a static attribute reached them as a string and a binding reached them raw.
 *
 * - `<kbq-dl wide>` and `<kbq-dl wide="">` passed the empty string, which is falsy - the attribute did
 *   nothing, and it means true now
 * - `<kbq-dl wide="false">` passed a non-empty string, which is truthy - it meant true, and means false now
 * - `vertical` is tri-state, so it keeps `null` through a transform that preserves it rather than
 *   `booleanAttribute`, which would fold "decide from the breakpoint" into false
 * - `minWidth`, `dtMinWidth` and `ddMinWidth` reached the layout arithmetic as strings; a value that is
 *   not a finite number now reads as `undefined` rather than reaching it at all
 *
 * Warn-only: every one of these is a template change, and which markup relied on the old reading is a
 * decision the call site owns.
 */

/** Import specifier that marks a file as a description list consumer. */
export const DL_PACKAGE = '@koobiq/components/dl';

/** Element selector of the description list. */
export const DL_ELEMENT = 'kbq-dl';

/** Boolean-ish inputs that gained a coercion transform. */
export const BOOLEAN_ATTRIBUTES: readonly string[] = ['wide', 'vertical'];

/** Numeric inputs that gained a coercion transform. */
export const NUMERIC_ATTRIBUTES: readonly string[] = ['minWidth', 'dtMinWidth', 'ddMinWidth', 'dtWidth'];

/** `dtWidth` is the one numeric input whose "no width" state is `null` rather than `undefined`. */
const NULL_FALLBACK_ATTRIBUTES: readonly string[] = ['dtWidth'];

/**
 * A static `wide` / `vertical` that used to be ignored, because the empty string is falsy. The advice
 * differs per attribute: `wide` really was inert, while `vertical` pinned the horizontal layout by not
 * being `null`, so deleting it hands the decision back to `verticalBreakpoint`.
 */
export const falsyBooleanMessage = (attribute: string, line: number): string =>
    `Line ${line}: a valueless (or empty) \`${attribute}\` on <kbq-dl> used to pass the empty string, ` +
    'which is falsy, so it did nothing. It is coerced now and the attribute means true. ' +
    (attribute === 'vertical'
        ? 'Write `[vertical]="false"` to keep the previous behavior: an unrecognised `vertical` was not ' +
          '`null`, so the list stayed pinned horizontal and never switched at `verticalBreakpoint` - ' +
          'deleting the attribute hands that decision back to the breakpoint.'
        : 'Remove it if the markup was relying on it being ignored.');

/** A static `wide="false"` / `vertical="false"`: a non-empty string, so it used to be truthy. */
export const truthyBooleanMessage = (attribute: string, value: string, line: number): string =>
    `Line ${line}: \`${attribute}="${value}"\` on <kbq-dl> used to pass a non-empty string, which is ` +
    `truthy, so it meant *true*. It is coerced now, and \`booleanAttribute("${value}")\` is ` +
    `${value === 'false' ? 'false' : 'true'}. This is the form whose meaning inverts.`;

/** A static numeric attribute that is not a finite number: it used to reach the arithmetic as a string. */
export const numericAttributeMessage = (attribute: string, line: number): string => {
    const fallback = NULL_FALLBACK_ATTRIBUTES.includes(attribute) ? '`null`' : '`undefined`';

    return (
        `Line ${line}: \`${attribute}\` on <kbq-dl> holds a value that is not a finite number. It used to ` +
        `reach the layout arithmetic as a string, where \`Math.max(0, "")\` made it 0; it reports ${fallback} ` +
        'now, and the layout falls back to the measured term width. A numeric literal behaves as before.' +
        (NULL_FALLBACK_ATTRIBUTES.includes(attribute)
            ? ' `dtWidth` also skipped the clamp against `dtMinWidth` entirely while it held a string, ' +
              'so a column could render narrower than its own minimum.'
            : '')
    );
};

/** A binding: the transform changes what the bound value means, with no compile error to point at it. */
export const boundAttributeMessage = (attributes: Iterable<string>, line: number): string =>
    `Line ${line}: ${[...attributes].map((name) => `\`[${name}]\``).join(', ')} on <kbq-dl> now runs the ` +
    'bound value through a coercion. `[vertical]="undefined"` used to leave the input `undefined`, which ' +
    'is not `null`, so the list stayed pinned horizontal; it is `null` now and the breakpoint decides. ' +
    'On `wide`, every falsy non-boolean inverts: `0` and `""` were falsy and are `true` now. A numeric ' +
    'binding that resolves to a non-number reads as `undefined` instead of reaching the arithmetic.';

/** Reported when a template renders the element but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders <kbq-dl> but could not be parsed, so none of its attributes were inspected. ' +
    'Check them by hand. If every template is reported this way, `@angular/compiler` could not be loaded ' +
    'from this install.';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `vertical` keeps `null` as its default - the state that lets the list decide from ' +
        '`verticalBreakpoint` - so it is coerced with a transform that preserves null rather than with ' +
        '`booleanAttribute`, which would have folded it into false.',
    '  `minWidth`, `dtMinWidth` and `ddMinWidth` report `number | undefined`. A value that is not a ' +
        'finite number reads as `undefined` rather than as `NaN`, so `?? fallback` at a call site fires.'
];
