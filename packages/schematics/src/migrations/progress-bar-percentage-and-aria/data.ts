/**
 * Data for the `progress-bar-percentage-and-aria` migration.
 *
 * The progress-bar review closed the one member that was never part of the component's contract and
 * gave the bar the semantics it had none of:
 *
 * - `percentage` — public getter over the clamped `value` → `protected` computed. It existed to feed
 *   the template; the rendered width is the observable half of it.
 * - The host renders `role="progressbar"` with mode-aware `aria-valuenow` / `aria-valuemin` /
 *   `aria-valuemax`, an `aria-label` that falls back to the new `progressBar` a11y locale key, and
 *   `aria-labelledby` / `aria-describedby` pointing at the projected text and caption.
 * - `KbqProgressBarText` and `KbqProgressBarCaption` render an `id` — generated, or the one bound —
 *   so the bar can reference them.
 * - The inner track no longer repeats the host `id`.
 *
 * Warn-only. `percentage` has no drop-in replacement expression, and a hand-rolled `role` or `aria-*`
 * on `<kbq-progress-bar>` is a decision about which of the two attributes survives.
 */

/** Import specifier that marks a file as a progress-bar consumer. */
export const PROGRESS_BAR_PACKAGE = '@koobiq/components/progress-bar';

/** Identifier and element shapes that mark a consumer without an import. */
export const PROGRESS_BAR_TYPE = '\\bKbqProgressBar\\w*\\b|\\bkbq-progress-bar\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: PROGRESS_BAR_TYPE,
        pattern: '\\.\\s*percentage\\b',
        message:
            'KbqProgressBar.percentage is protected and signal-backed. It only ever existed to feed the ' +
            'template, and the clamp it performs is observable through the rendered width and through ' +
            'aria-valuenow. Clamp the value at the call site — Math.max(0, Math.min(100, value)) — or ' +
            'read the aria-valuenow attribute of the host.'
    },
    {
        anchor: PROGRESS_BAR_TYPE,
        pattern: '<kbq-progress-bar[^>]*\\s(?:role|aria-valuenow|aria-valuemin|aria-valuemax|aria-labelledby)\\s*=',
        message:
            'The bar renders role="progressbar" with aria-valuenow/valuemin/valuemax of its own (all three ' +
            'omitted in indeterminate mode, which is how an unknown duration is expressed), plus ' +
            'aria-labelledby for a projected [kbq-progress-bar-text]. A hand-rolled attribute on the same ' +
            'element is a duplicate now — drop it.'
    },
    {
        anchor: PROGRESS_BAR_TYPE,
        pattern: '<kbq-progress-bar[^>]*\\saria-label\\s*=',
        message:
            'aria-label is an input on KbqProgressBar now, not a plain attribute. A static aria-label still ' +
            'binds and still wins over the projected [kbq-progress-bar-text]; an [attr.aria-label] binding ' +
            'has to become [aria-label], because the host writes that attribute itself.'
    },
    {
        anchor: '\\bkbq-progress-bar-(?:text|caption)\\b',
        pattern: '\\bkbq-progress-bar-(?:text|caption)\\b[^>]*\\sid\\s*=',
        message:
            'kbq-progress-bar-text and kbq-progress-bar-caption render an id — the one bound, or a generated ' +
            'one — so the bar can reference them from aria-labelledby / aria-describedby. An existing id ' +
            'attribute is preserved; nothing to change unless the element also had [attr.id].'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Under prefers-reduced-motion: reduce an indeterminate bar used to render as a full, finished ' +
        'determinate bar: the fill was sized only inside the keyframes, so suppressing the animation left ' +
        'it at width: auto. It is a quarter-width fill with an opacity pulse now, and the determinate ' +
        'width transition is suppressed under the same preference.',
    '  [color] covers theme (default), contrast, contrast-fade and error. Every other value used to ' +
        'render both the track and the fill transparent; an unsupported — or falsy — value falls back to ' +
        'the default palette now. The error and contrast bars an application already had become visible.',
    '  The a11y locale gained a progressBar key, used as the accessible name of a bar that carries ' +
        'neither aria-label nor a projected [kbq-progress-bar-text]. An application overriding the a11y ' +
        'section through kbqA11yLocaleConfigurationProvider can override it too.',
    '  The inner track no longer repeats the host id, so a single bar renders exactly one element ' +
        'carrying that id and an aria-describedby or <label for> aimed at it is no longer ambiguous.'
];
