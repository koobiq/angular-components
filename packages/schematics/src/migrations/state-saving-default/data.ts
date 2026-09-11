/**
 * Data for the `state-saving-default` migration.
 *
 * `KbqTabGroup`, `KbqSidebar` and `KbqContentPanelContainer` persist the state a user changes now, and
 * `useStateSaving` defaults to `true` on all three. Each of them keeps the state out of the store while
 * the application drives it — a bound `selectedIndex`/`activeTab`, `opened` on the sidebar, `opened` on
 * the content panel — so only the markup that says nothing about those is reached by the change.
 *
 * Warn-only. The markup whose behaviour changed is exactly the markup that says nothing about the input,
 * so there is no expression to rewrite — and rewriting it to `[useStateSaving]="false"` would withhold
 * the feature this release is shipping.
 */

/** Import specifiers that mark a file as a consumer of one of the three components. */
export const PACKAGES = [
    '@koobiq/components/tabs',
    '@koobiq/components/sidebar',
    '@koobiq/components/content-panel'
];

/** Identifier and element shapes that mark a consumer without an import. */
export const CONSUMER_TYPE =
    '\\bKbqTabGroup\\b|\\bKbqSidebar\\b|\\bKbqContentPanelContainer\\b|' +
    '\\bkbq-tab-group\\b|\\bkbq-sidebar\\b|\\bkbq-content-panel-container\\b';

export interface WarnPattern {
    /** Owner of the change. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The markup or call sites the change reaches. */
    pattern: string;
    /** When present, the file is skipped if this matches — for reporting an absence. */
    unless?: string;
    message: string;
}

const TAB_GROUP = '<kbq-tab-group\\b';
const SIDEBAR = '<kbq-sidebar\\b';
const CONTENT_PANEL = '<kbq-content-panel-container\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TAB_GROUP,
        pattern: TAB_GROUP,
        // A bound selection stays with the application, so those groups are unaffected.
        unless: '\\buseStateSaving\\b|\\[\\(?selectedIndex\\)?\\]|\\[\\(?activeTab\\)?\\]',
        message:
            'Tab groups remember the selected tab by default now: useStateSaving defaults to true. Pass ' +
            '[useStateSaving]="false" to keep the previous behaviour. Nothing is persisted while ' +
            'selectedIndex or activeTab is bound, and kbq-tab-nav-bar never persists — the router owns ' +
            'which link is active there.'
    },
    {
        anchor: TAB_GROUP,
        pattern: '<kbq-tab\\b',
        unless: '\\btabId\\b|\\buseStateSaving\\b|\\[\\(?selectedIndex\\)?\\]|\\[\\(?activeTab\\)?\\]',
        message:
            'These tabs carry no tabId, so the selection is persisted by position. A position survives a ' +
            'reload but not a reordering, and then restores the wrong tab — a dev-mode warning says so. ' +
            'Give the tabs a tabId.'
    },
    {
        anchor: SIDEBAR,
        pattern: SIDEBAR,
        // `[opened]` means the application decides, and the sidebar then persists nothing.
        unless: '\\buseStateSaving\\b|\\[opened\\]',
        message:
            'Sidebars remember whether they were open, and the width they were last closed at, by default ' +
            'now: useStateSaving defaults to true. Pass [useStateSaving]="false" to keep the previous ' +
            'behaviour. Nothing is persisted while opened is bound.'
    },
    {
        anchor: CONTENT_PANEL,
        pattern: CONTENT_PANEL,
        unless: '\\buseStateSaving\\b',
        message:
            'Content panels remember their width, and whether they were open, by default now: ' +
            'useStateSaving defaults to true. Pass [useStateSaving]="false" to keep the previous ' +
            'behaviour. The opened state is left alone while [opened] is bound, but the width is restored ' +
            'either way — there is no widthChange output, so a drag never reached the application anyway.'
    },
    {
        // Programmatic access names the class, which the markup-only anchor does not cover.
        anchor: '\\bKbqContentPanelContainer\\b',
        pattern: '\\.\\s*opened\\s*\\(',
        message:
            'KbqContentPanelContainer.opened is now openedInput, and reads undefined rather than false ' +
            'while nothing binds it — which is how the panel tells a bound opened from an unbound one. ' +
            'The markup is unchanged; read isOpened() for the state itself.'
    }
];

/** Printed once, after the per-file reports. */
export const SUMMARY = [
    '  A component rendered inside an overlay does not persist: it is not in the document when it',
    '  initializes and so has no stable key. The key otherwise comes from stateSavingKey, or is derived',
    '  from the position in the document when none is given.',
    '  Storage format: entries are written under a "kbq.state." prefix and carry a timestamp, so an',
    '  entry stranded by a markup change is collected once it outlives KBQ_STATE_SAVING_TTL (90 days by',
    '  default).',
    '  Provide KBQ_STATE_STORE to persist somewhere else (KbqSessionStorageStateStore is bundled), and',
    '  KBQ_STATE_SAVING_KEY_RESOLVER to derive the key from something other than the document position.'
];
