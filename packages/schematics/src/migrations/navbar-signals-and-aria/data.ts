/**
 * Data for the `navbar-signals-and-aria` migration.
 *
 * The navbar review turned the remaining `@Input()` accessors into signals, replaced the inheritance from
 * `KbqTooltipTrigger` on `KbqNavbarItem` / `KbqNavbarBrand` with composition, collapsed the mutually derived
 * `horizontal` / `vertical` booleans of `KbqNavbarRectangleElement` into a single `orientation`, and moved the
 * accessibility state onto standard ARIA attributes.
 *
 * Template *bindings* (`[expanded]`, `[collapsable]`, `[collapsedText]`, `[kbqTooltip]`, …) keep working;
 * what breaks is programmatic access and reads through a template reference variable.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** A navbar class whose members changed, and how to recognize a receiver of that class. */
export interface NavbarReceiverType {
    /** TypeScript type annotation that marks a receiver as this class. */
    type: string;
    /** `exportAs` of the directive, when it has one: a `#ref="…"` in a template points at one. */
    exportAs?: string;
    /** Members whose value is unchanged: a read becomes a call. Auto-fixed. */
    signalMembers: readonly string[];
    /** Of those, the ones backed by `model()`, so a write becomes `.set(…)` rather than a compile error. */
    writableMembers: readonly string[];
}

export const RECEIVER_TYPES: readonly NavbarReceiverType[] = [
    {
        type: 'KbqVerticalNavbar',
        exportAs: 'KbqVerticalNavbar',
        signalMembers: ['expanded', 'configuration', 'openOver', 'tabIndex'],
        writableMembers: ['expanded', 'tabIndex']
    },
    {
        type: 'KbqNavbar',
        signalMembers: ['tabIndex'],
        writableMembers: ['tabIndex']
    },
    {
        type: 'KbqFocusableComponent',
        signalMembers: ['tabIndex'],
        writableMembers: ['tabIndex']
    },
    {
        type: 'KbqNavbarItem',
        exportAs: 'kbqNavbarItem',
        signalMembers: ['isCollapsed', 'collapsable', 'collapsedText'],
        writableMembers: []
    },
    {
        type: 'KbqNavbarBrand',
        exportAs: 'kbqNavbarBrand',
        signalMembers: ['collapsed', 'collapsedText'],
        writableMembers: []
    }
];

/**
 * Methods of the signal/model API. A member access followed by one of these is already migrated, so no `()` is
 * appended. This is what makes the migration idempotent.
 */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** Type annotation of the element whose two orientation booleans became one `orientation`. */
export const RECTANGLE_TYPE = 'KbqNavbarRectangleElement';

/** `x.horizontal = true` → `x.orientation = 'horizontal'`; the same for `vertical`. */
export const ORIENTATION_WRITES: ReadonlyMap<string, string> = new Map([
    ['horizontal', 'horizontal'],
    ['vertical', 'vertical']
]);

/** `x.horizontal` → `x.isHorizontal()`; the same for `vertical`. */
export const ORIENTATION_READS: ReadonlyMap<string, string> = new Map([
    ['horizontal', 'isHorizontal'],
    ['vertical', 'isVertical']
]);

/**
 * Members accessed on a navbar receiver that disappeared or changed their meaning. Reported with the file they
 * were found in; never rewritten, because the replacement depends on what the call site wanted.
 */
export const MANUAL_MEMBERS: ReadonlyMap<string, string> = new Map([
    [
        'disabled',
        '`KbqNavbarItem.disabled` / `KbqNavbarBrand.disabled` are gone. They never meant "not interactive" — ' +
            'they suppressed the tooltip — while sharing a name with the real disabled state of the same ' +
            'element. Read the interactive state as `item.navbarFocusableItem.disabled`, and control the ' +
            'tooltip with the `kbqTooltipDisabled` input (`item.tooltipDisabled()`).'
    ],
    [
        'content',
        '`KbqNavbarItem` / `KbqNavbarBrand` no longer extend `KbqTooltipTrigger`; they own one. Use ' +
            '`item.tooltip.content` (the `[kbqTooltip]` binding is unchanged).'
    ],
    [
        'visibleChange',
        '`KbqNavbarItem` / `KbqNavbarBrand` no longer extend `KbqTooltipTrigger`; they own one. Subscribe to ' +
            '`item.tooltip.visibleChange` (the `(kbqVisibleChange)` binding is unchanged).'
    ],
    [
        'updateDropdown',
        '`KbqNavbarItem.updateDropdown()` is private now: the item refreshes its dropdown itself whenever the ' +
            'ambient navbar changes orientation or collapses. Delete the call.'
    ],
    [
        'hovered',
        '`KbqNavbarLogo.hovered` / `KbqNavbarTitle.hovered` were removed — nothing ever subscribed to them and ' +
            'they were never completed. Bind the pointer enter/leave events on the element instead.'
    ]
]);

/**
 * Warnings for `.ts` files. Checked against the post-fix content, so an auto-fixed usage does not also produce
 * a "manual migration required" note. Only evaluated for files that reference the navbar.
 */
export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\bKbqNavbarContainerPositionType\\b',
        message:
            '`KbqNavbarContainerPositionType` was removed: it had no consumer and `KbqNavbarContainer` has no ' +
            'position input to feed it. Delete the import.'
    },
    {
        pattern: '\\bKbqNavbarItem\\b[\\s\\S]{0,200}?\\.(?:show|hide)\\s*\\(',
        message:
            '`show()` / `hide()` came from `KbqTooltipTrigger`, which `KbqNavbarItem` / `KbqNavbarBrand` no ' +
            'longer extend. Call them on the owned trigger: `item.tooltip.show()`.'
    },
    {
        pattern: '\\bKbqNavbarRectangleElement\\b',
        message:
            '`KbqNavbarRectangleElement.horizontal` / `.vertical` are read-only derived signals now ' +
            '(`isHorizontal()` / `isVertical()`); the orientation is written through `orientation = ' +
            "'horizontal' | 'vertical'`. `collapsed` is still a boolean accessor, and `collapsedState` is its " +
            'signal mirror for `computed()` consumers.'
    },
    {
        pattern: '\\bKBQ_VERTICAL_NAVBAR_CONFIGURATION\\b',
        message:
            '`KBQ_VERTICAL_NAVBAR_CONFIGURATION` is now `InjectionToken<KbqVerticalNavbarConfiguration>`, so a ' +
            'provided value is type-checked. `KbqVerticalNavbar.configuration` became a signal: read it as ' +
            '`configuration()`.'
    }
];

/** Stylesheet warnings: the disabled state moved off a content attribute that never meant anything there. */
export const styleWarnPatterns: WarnPattern[] = [
    {
        pattern: '(?:kbq-navbar-item|kbq-navbar-brand|kbq-navbar-toggle)[^{,]*\\[disabled\\]',
        message:
            'A disabled navbar item no longer renders the `disabled` content attribute — it is meaningless on ' +
            'a custom element and ignored by assistive technology. Match `[aria-disabled="true"]` or the ' +
            '`.kbq-disabled` class instead.'
    }
];

/** Behaviour changes that no usage pattern can point at, printed once per run. */
export const BEHAVIOUR_NOTE = [
    'Behaviour changes with no call site to migrate:',
    '- Ctrl+/ now toggles one vertical navbar - the one holding focus, falling back to the first on the page.',
    '  It used to toggle every one of them at once, because each toggle bound its own window listener.',
    '- The horizontal and the vertical navbar are both announced as `role="navigation"` landmarks and accept',
    '  an `aria-label` input. Items authored as `<kbq-navbar-item>` (not as `<a>`/`<button>`, and not wrapping',
    '  a button or form field) are announced as `role="button"` and answer to Enter/Space;',
    '  `<kbq-navbar-divider>` is `role="separator"`.',
    '- A collapsed item or brand publishes its title as `aria-label`; the tooltip alone never named it. Set the',
    '  new `aria-label` input on an icon-only item that has no title of its own.',
    '- `.kbq-navbar` left the CDK overlay layer (1000). The navbar, its toggle and an open-over container now',
    '  read `--kbq-navbar-z-index` / `--kbq-navbar-toggle-z-index` / `--kbq-navbar-vertical-open-over-z-index`',
    '  (990 / 991 / 989), so overlays render above the navbar instead of fighting it for the same layer.',
    '- The hard-coded sizes became tokens: `--kbq-navbar-vertical-size-expanded-width`,',
    '  `--kbq-navbar-item-vertical-size-height`, `--kbq-navbar-toggle-size-circle` and',
    '  `--kbq-navbar-brand-vertical-size-title-max-width`.',
    '- `!important` is gone from the collapsed brand title and from the navbar item icon color; both now win',
    '  on specificity. An override that relied on losing to `!important` may start applying.'
];

/** Reported when a template names a navbar but cannot be parsed, so nothing was rewritten in it. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template references the navbar but could not be parsed, so it was left untouched. Migrate reads ' +
    'through its template reference variable by hand.';
