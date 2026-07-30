/**
 * Replacement data for the v20.3.0 button review.
 *
 * Three unrelated clusters landed together and are migrated by one schematic
 * because they all originate from the same release:
 *
 * 1. Host attributes of `[kbq-button]` — `disabled` / `aria-disabled` are now
 *    chosen by host tag, `tabindex` is omitted when redundant, and an `<a>`
 *    without `href` is announced as a button.
 * 2. `KbqButtonGroupRoot` no longer overwrites a `kbqStyle` / `color` the button
 *    sets itself, and its `disabled` became additive.
 * 3. Styles — four physical border-radius mixins were replaced by logical ones,
 *    the `.kbq-progress` utility moved into `kbq-core()`, and two dead custom
 *    properties were dropped.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/**
 * Physical border-radius mixins removed from `core/styles/common/_groups-mixins.scss`
 * and `core/styles/common/_groups.scss` (the latter re-exported through
 * `core/styles/common/_index.scss`), mapped to the logical mixins that replaced them.
 *
 * The replacement is not a rename: `border-inline-end-radius` follows `dir`, so
 * under `dir="rtl"` it rounds the corners the old `border-right-radius` did not.
 * That is the point of the change — the library moved its own group styling the
 * same way — but it is a behaviour change for a physically-designed RTL layout.
 */
export const REMOVED_MIXINS: Record<string, string> = {
    'border-right-radius': 'border-inline-end-radius',
    'border-left-radius': 'border-inline-start-radius',
    'border-top-radius': 'border-block-start-radius',
    'border-bottom-radius': 'border-block-end-radius'
};

/**
 * Matches a mixin call, optionally namespaced (`@include groups-mixins.border-right-radius(0)`).
 *
 * Anchored on `@include` on purpose: these identifiers only ever appear as Sass
 * mixin calls, so a CSS declaration, a custom property name or a comment that
 * happens to contain the same text is never rewritten.
 */
export const MIXIN_INCLUDE_PATTERN = /(@include\s+(?:[\w$-]+\.)?)(border-(?:right|left|top|bottom)-radius)\b/g;

/** Attribute / element names identifying a button group in a template. */
export const GROUP_ATTRIBUTES = ['kbqButtonGroupRoot', 'kbq-button-group'];
export const GROUP_ELEMENT = 'kbq-button-group';

/** The button attribute marking a host as `KbqButton`. */
export const BUTTON_ATTRIBUTE = 'kbq-button';

/**
 * Inputs a nested button may now own. A group used to overwrite these on every
 * update; it now leaves them alone once the button sets them itself.
 */
export const OWNED_INPUTS = ['kbqStyle', 'color', 'disabled'];

/** Reported for a nested button that declares one of {@link OWNED_INPUTS}. */
export const groupOverrideMessage = (inputs: string[]): string =>
    `This button sets ${inputs.map((input) => `\`${input}\``).join(' / ')} inside a button group. ` +
    'Until 20.3.0 the group overwrote that value on every update; it now treats the button as the owner ' +
    'and leaves it alone. Drop the binding if you wanted the group value, or keep it if you wanted the override.';

/** Warnings for `.ts` files. */
export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\bKbqButtonGroupRoot\\b',
        message:
            'KbqButtonGroupRoot changed: `disabled` now reads `boolean | undefined` (it stays undefined while ' +
            'the input is unbound) and is additive — re-enabling the group no longer enables a button disabled ' +
            'through its own input. Style and color are no longer propagated to a button that sets them itself.'
    },
    {
        pattern: '\\bKbqButtonCssStyler\\b',
        message:
            'KbqButtonCssStyler.nativeElement is now readonly and `icons` is typed Signal<readonly KbqIcon[]> ' +
            'instead of readonly any[]. Assignments and untyped member access no longer compile.'
    },
    {
        pattern: '(get|has)Attribute\\(\\s*[\'"]disabled[\'"]',
        message:
            'The disabled attribute moved: `<a kbq-button>` no longer renders `disabled` (it renders ' +
            'aria-disabled="true", tabindex="-1" and .kbq-disabled), and `<button kbq-button>` no longer renders ' +
            'aria-disabled (only the native disabled attribute). Assertions and queries need updating.'
    },
    {
        pattern: '\\bKBQ_LOCALE_DATA\\b|\\.addLocale\\(',
        message:
            'Locale data gained an `a11y` section holding the accessible names of the built-in icon-only buttons ' +
            '(modal / popover / sidepanel close, calendar navigation, inline-edit save and cancel, and others). ' +
            'Custom locale data without it falls back to the ru-RU strings — add the section, or provide ' +
            'kbqA11yLocaleConfigurationProvider(...).'
    }
];

/** Warnings for `.scss` / `.css` files. */
export const styleWarnPatterns: WarnPattern[] = [
    {
        pattern: '--kbq-button-icon-size-(vertical-padding|content-padding)\\b',
        message:
            'The --kbq-button-icon-size-vertical-padding and --kbq-button-icon-size-content-padding custom ' +
            'properties were removed. Nothing read them even before 20.3.0, so an override was already inert — ' +
            'delete it. Icon buttons use --kbq-button-icon-size-horizontal-padding and ' +
            '--kbq-button-size-content-padding.'
    },
    {
        pattern: '^(?=[\\s\\S]*kbq-button)(?=[\\s\\S]*\\[disabled\\])',
        message:
            'This stylesheet mentions kbq-button and a [disabled] selector. A disabled `<a kbq-button>` no ' +
            'longer carries the disabled attribute, so `a[kbq-button][disabled]` never matches now — use ' +
            '.kbq-disabled or [aria-disabled="true"]. Selectors targeting `<button kbq-button>` still work.'
    },
    {
        pattern: '@use\\s+[\'"][^\'"]*core/styles/common(/animation)?[\'"]',
        message:
            'Importing core/styles/common/animation no longer emits the `.kbq-progress` rule or its keyframes — ' +
            'they moved into the `kbq-progress()` mixin, emitted once by `kbq-core()`. If you relied on the ' +
            'import to ship that CSS, include the prebuilt theme (which calls kbq-core()) or add ' +
            '`@include animation.kbq-progress();` yourself.'
    }
];

/** Reported when a template mentions a button group but cannot be parsed, so nothing was inspected in it. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template mentions a button group but could not be parsed, so it was not inspected. ' +
    'Check by hand whether a nested button sets its own kbqStyle / color / disabled.';

/**
 * Behaviour note printed once per run. Nothing here needs a code change, but all
 * of it is observable in tests, stylesheets and screenshots.
 */
export const BEHAVIOUR_NOTE = [
    'Rendered attributes changed for [kbq-button]:',
    '  - <a kbq-button [disabled]>  drops `disabled`, keeps aria-disabled="true" + tabindex="-1" + .kbq-disabled',
    '  - <button kbq-button [disabled]>  drops `aria-disabled`, keeps the native `disabled`',
    '  - <button kbq-button>  no longer renders tabindex="0" (anchors still do)',
    '  - <a kbq-button> without href is announced as role="button"',
    '  - every [kbqDropdownTriggerFor] now renders aria-expanded',
    '  - the built-in icon-only buttons now render a localized aria-label',
    'Icon gaps and group corner radii follow `dir` now, so an RTL layout mirrors instead of staying physical.',
    'The .kbq-progress utility is emitted by kbq-core() only — it is no longer part of button.css / toggle.css.',
    'Snapshot and DOM-query tests covering any of the above need updating.'
];
