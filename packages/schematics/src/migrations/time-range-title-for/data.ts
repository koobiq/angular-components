/**
 * Data for the removal of `title.for` from the time-range locale configuration.
 *
 * The title of `kbq-time-range` used to prepend `title.for` ("за" / "for") to the selected period. The
 * period now stands alone ("последний час" / "Last hour") and the duration templates of each locale carry
 * whatever word it needs, so the key was removed.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** The key removed from the `title` section of the time-range locale configuration. */
export const REMOVED_KEY = 'for';

/** The section that held the removed key. */
export const TITLE_KEY = 'title';

/** The time-range section of the locale data (`addLocale()`, `KBQ_LOCALE_DATA`, `[localeOverrides]`). */
export const TIME_RANGE_KEY = 'timeRange';

/** The provider whose argument is a time-range locale configuration. */
export const PROVIDER_NAME = 'kbqTimeRangeLocaleConfigurationProvider';

/** Siblings of `title` that only a time-range locale configuration has. */
export const SIBLING_KEYS = ['editor', 'durationTemplate'];

/**
 * Cheap pre-check gating the AST parse: a `for` member of an object literal (`for:` or `'for':`). A
 * preceding word character or dot rules out longer identifiers and property reads, which are warn-only.
 */
export const FOR_MEMBER_PATTERN = /(?:^|[^.\w$])(['"]?)for\1\s*:/;

/**
 * Warnings for `.ts` and `.html` files, inline templates included. Checked against the post-fix content,
 * so they only fire on what the fix left behind.
 */
export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\btitle\\.for\\b',
        message:
            'The `for` key was removed from the title section of the time-range locale configuration: the ' +
            'title shows the period alone. Drop this read. Manual migration required.'
    },
    {
        pattern: '\\btitle\\s*:\\s*\\{[^{}]*\\bfor\\s*:',
        message:
            'A `for` key in a `title` section the fix did not rewrite: a time-range locale override it could not ' +
            'recognise, or one bound in a template. Remove the key, or ignore this if the object is not a ' +
            'time-range locale override.'
    }
];

/** Behaviour note printed once per run — the parts no call site can point at. */
export const BEHAVIOUR_NOTE = [
    'Time-range title behaviour changed:',
    '  - The title no longer prepends `title.for` to the selected period: it reads "последний час" /',
    '    "Last hour" rather than "за последний час" / "for last hour". A custom title template receives',
    '    the period alone in `formattedDate`.',
    '  - If you prefixed a word through `title.for`, move it into your `durationTemplate.title` overrides.'
];
