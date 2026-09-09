import { SignalMembersConfig, WarnPattern } from '../../utils/signal-members-migration';

/**
 * Data for the `dropdown-signals` migration.
 *
 * The dropdown was the only component in the v21 review campaign whose decorators were left in place.
 * Twenty of its twenty-one `@Input`/`@Output`/query members are signals now, so every programmatic read
 * of them is a call.
 *
 * Six are `model()`s rather than `input()`s, because in-repo hosts position the panel they were handed:
 * `kbq-split-button` writes `xPosition`, and `kbq-navbar-item` writes both overlap flags, `offsetX` and
 * `openByArrowDown`. A write to one of those has a mechanical translation to `.set(...)`; a write to a
 * read-only input does not, and is left to become a compile error.
 *
 * `KbqDropdownItem.textElement` is deliberately absent: it implements `KbqTitleTextRef`, a contract five
 * other components implement as a plain property, so it stayed a `@ViewChild`.
 */

const DROPDOWN_ANCHOR = '\\bKbqDropdown\\w*\\b';

/** Which members each type owns. A receiver resolves to one type, so the rewrite is scoped by it. */
export const MEMBERS_BY_TYPE: Readonly<Record<string, readonly string[]>> = {
    KbqDropdown: [
        'xPosition',
        'yPosition',
        'overlapTriggerX',
        'overlapTriggerY',
        'hasBackdrop',
        'backdropClass',
        'templateRef',
        'items',
        'lazyContent'
    ],
    KbqDropdownTrigger: ['offsetX', 'offsetY', 'data', 'openByArrowDown', 'restoreFocus', 'dropdown'],
    KbqDropdownItem: ['disabled', 'icon']
};

/**
 * `exportAs` names a template reference can be bound to. The trigger is a directive on an arbitrary
 * element, so `#t="kbqDropdownTrigger"` is the only way a template names it.
 */
export const EXPORT_AS_TO_TYPE: Readonly<Record<string, string>> = {
    kbqDropdown: 'KbqDropdown',
    kbqDropdownTrigger: 'KbqDropdownTrigger',
    kbqDropdownItem: 'KbqDropdownItem'
};

/** Element selectors whose bare `#ref` points at one of the migrated types. */
export const ELEMENT_TO_TYPE: Readonly<Record<string, string>> = {
    'kbq-dropdown': 'KbqDropdown',
    'kbq-dropdown-item': 'KbqDropdownItem'
};

/** The `model()` members, whose `x = v` becomes `x.set(v)`. */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set([
    'xPosition',
    'yPosition',
    'overlapTriggerX',
    'overlapTriggerY',
    'offsetX',
    'openByArrowDown'
]);

/** Members that moved from `public` to `protected` and can no longer be read from outside. */
export const PROTECTED_MEMBERS: readonly string[] = ['classList'];

export const PROTECTED_HINT =
    'It is derived state now — the position classes, the safe-area class and the `class` input are ' +
    'folded into one `computed`. Set `class` on `<kbq-dropdown>` to add your own.';

export const warnPatterns: readonly WarnPattern[] = [
    {
        anchor: DROPDOWN_ANCHOR,
        pattern:
            '\\bitems\\s*\\.\\s*(?:reset|notifyOnChanges|toArray|forEach|filter|map|find|some)\\s*\\(|\\bitems\\s*\\.\\s*(?:changes|first|last)\\b',
        message:
            '`KbqDropdown.items` is a `Signal<readonly KbqDropdownItem[]>` now, not a `QueryList`. ' +
            '`items().length` and the array methods on `items()` still work; `changes`, `first`, `last` and ' +
            '`toArray()` do not. Use `toObservable(panel.items)` for the stream, and `adoptItems()` instead ' +
            'of `items.reset(...)`.'
    },
    {
        anchor: DROPDOWN_ANCHOR,
        pattern: '\\bclosed\\s*\\.\\s*(?:pipe|asObservable|complete|subscribe\\s*\\([^)]*,)',
        message:
            '`KbqDropdown.closed` is an `output()` now. It has `emit()` and `subscribe(fn)`, but no ' +
            '`pipe()`, `asObservable()` or `complete()`, and `subscribe` takes a single callback. Wrap it ' +
            'in `outputToObservable(panel.closed)` from `@angular/core/rxjs-interop` to keep an operator chain.'
    },
    {
        anchor: DROPDOWN_ANCHOR,
        pattern: 'implements\\s+[^{]*\\bKbqDropdownPanel\\b',
        message:
            'Every member of `KbqDropdownPanel` changed shape: `xPosition`, `yPosition` and both overlap ' +
            'flags are `WritableSignal`s, `templateRef`, `hasBackdrop`, `backdropClass` and `lazyContent` are ' +
            '`Signal`s, `items` is a `Signal<readonly KbqDropdownItem[]>`, and `closed` is an ' +
            '`OutputEmitterRef`. A custom panel has to be updated by hand; the optional `adoptItems` replaces ' +
            'the `items.reset(...)` the trigger used to perform on it.'
    },
    {
        anchor: DROPDOWN_ANCHOR,
        pattern:
            '\\b(?:viewChild|contentChild)(?:\\s*\\.\\s*required)?\\s*(?:<[^<>()]*>)?\\s*\\(\\s*KbqDropdown(?:Trigger|Item)?\\b',
        message:
            'A `viewChild(KbqDropdown)` / `contentChild(KbqDropdownItem)` query is itself a signal, so ' +
            'reading a member through it is a double call: `this.panel().items()`. Those reads are resolved ' +
            'and rewritten where the query is assigned to a field; check any other shape by hand.'
    },
    {
        anchor: DROPDOWN_ANCHOR,
        pattern: '\\bpanelClass\\s*=[^=]',
        message:
            "`KbqDropdown.panelClass` was a write-only `@Input('class')` and is a read-only `input()` " +
            'aliased to `class` now. Set it in the template — `<kbq-dropdown class="...">` or ' +
            '`[class]="..."` — rather than assigning to the property.'
    }
];

export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders a dropdown but could not be parsed, so it was left untouched. Migrate reads ' +
    'through its template reference variables by hand.';

export const UNRESOLVED_RECEIVER_MESSAGE =
    'A dropdown type is used here in a way this migration cannot resolve to a single receiver, so any ' +
    'signal read through it was left untouched. Check these lines by hand:';

export const SUMMARY: readonly string[] = [
    '  Twenty members across `KbqDropdown`, `KbqDropdownTrigger` and `KbqDropdownItem` are signals now, so ' +
        'a read is a call. A read left un-called is silent in a template: `{{ panel.xPosition }}` prints the ' +
        'function source, and `@if (item.disabled)` is always true.',
    '  `xPosition`, `yPosition`, `overlapTriggerX`, `overlapTriggerY`, `offsetX` and `openByArrowDown` are ' +
        '`model()`s, so a write becomes `.set(...)`. `model()` takes no `transform`, so they no longer coerce ' +
        'a string attribute: use `[overlapTriggerX]="true"`, not `overlapTriggerX="true"`.',
    '  `KbqDropdownItem.disabled` is a signal, and `ListKeyManagerOption.disabled` accepts one. A custom ' +
        'option that passes a signal to a key manager works; one that reads `item.disabled` as a plain ' +
        'property does not — a signal is a function, so every item reads as disabled.',
    '  `KbqDropdownItem.textElement` is unchanged. It implements `KbqTitleTextRef`, which `KbqTitle` and five ' +
        'other components read as a plain property.'
];

export const config: SignalMembersConfig = {
    label: '[dropdown-signals]',
    package: '@koobiq/components/dropdown',
    membersByType: MEMBERS_BY_TYPE,
    exportAsToType: EXPORT_AS_TO_TYPE,
    elementToType: ELEMENT_TO_TYPE,
    writableMembers: WRITABLE_MEMBERS,
    protectedMembers: PROTECTED_MEMBERS,
    warnPatterns,
    messages: {
        unparseableTemplate: UNPARSEABLE_TEMPLATE_MESSAGE,
        unresolvedReceiver: UNRESOLVED_RECEIVER_MESSAGE,
        protectedHint: PROTECTED_HINT,
        summary: SUMMARY
    }
};
