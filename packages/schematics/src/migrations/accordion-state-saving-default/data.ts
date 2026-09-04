/**
 * Data for the `accordion-state-saving-default` migration.
 *
 * `KbqAccordion.useStateSaving` defaults to `true`. An accordion that was never configured to persist
 * anything now remembers which sections the user left open, which changes three things a consumer can
 * only find out by reading:
 *
 * - `defaultValue` applies to the first visit only. From the second one on, the persisted state wins.
 * - The storage key is derived from where the accordion sits in the document when no `stateSavingKey`
 *   is given, so restructuring the markup above it strands what was saved under the previous key.
 * - An item with no `value` persists its position inside the accordion, not the id it used to report.
 *
 * Warn-only. The markup whose behaviour changed is exactly the markup that says nothing about the
 * input, so there is no expression to rewrite — and rewriting it to `[useStateSaving]="false"` would
 * withhold the feature this release is shipping.
 */

/** Import specifiers that mark a file as an accordion consumer. */
export const ACCORDION_PACKAGE = '@koobiq/components/accordion';

/** Identifier and element shapes that mark a consumer without an import. */
export const ACCORDION_TYPE = '\\bKbqAccordion\\b|<kbq-accordion\\b|\\bkbq-accordion\\b';

export interface WarnPattern {
    /** Owner of the change. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The markup or call sites the change reaches. */
    pattern: string;
    /** When present, the file is skipped if this matches — for reporting an absence. */
    unless?: string;
    message: string;
}

const ACCORDION_ANCHOR = '<kbq-accordion\\b|\\bkbq-accordion\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: ACCORDION_ANCHOR,
        pattern: ACCORDION_ANCHOR,
        unless: '\\buseStateSaving\\b',
        message:
            'Accordions persist their expanded sections by default now: useStateSaving defaults to true ' +
            'instead of false. Pass [useStateSaving]="false" to keep the previous behaviour. To keep it ' +
            'but pin where the state is stored, give the accordion a stateSavingKey — or an id, which ' +
            'anchors the key derived from the document just as well.'
    },
    {
        anchor: ACCORDION_ANCHOR,
        pattern: '\\bdefaultValue\\b',
        unless: '\\[useStateSaving\\]="false"',
        message:
            'defaultValue now applies to the first visit only — from the second one on, the sections the ' +
            'user left open win. Pass [useStateSaving]="false" if the application owns the initial state.'
    },
    {
        anchor: '<kbq-accordion-item\\b|\\bkbq-accordion-item\\b',
        pattern: '<kbq-accordion-item\\b|\\bkbq-accordion-item\\b',
        unless: '\\[value\\]|\\svalue="|\\[useStateSaving\\]="false"',
        message:
            'Accordion items with no value are persisted by position now, and KbqAccordionItem.value ' +
            'reports that position instead of the item id — the id carries a global instantiation ' +
            'counter, which shifts as soon as anything else on the page is created ahead of the ' +
            'accordion. Give each item an explicit value if valueChange payloads are compared anywhere.'
    }
];

/** Printed once, after the per-file reports. */
export const SUMMARY = [
    '  Storage format: entries are written under a "kbq.state." prefix and carry a timestamp, so an',
    '  entry stranded by a markup change is collected once it outlives KBQ_STATE_SAVING_TTL (90 days by',
    '  default). An entry written by 20.2.0 under the bare key is still read, but never rewritten or',
    '  removed — the first save moves the state under the prefix and the original is left for the',
    '  application to clean up.',
    '  Provide KBQ_STATE_STORE to persist somewhere else (KbqSessionStorageStateStore is bundled), and',
    '  KBQ_STATE_SAVING_KEY_RESOLVER to derive the key from something other than the document position.'
];
