/**
 * Data for the `tabs-signals` migration.
 *
 * The decorator inputs of the tabs are signal inputs named `<member>Input` now, handed to the unchanged member from
 * `ngOnChanges`, and their decorator queries are signal queries behind getters. Reads and writes of the members are
 * unchanged; a subclass and a hand-made `SimpleChanges` are not. Warn-only.
 */

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor: string;
    pattern: string;
    message: string;
}

const CLASSES = [
    'KbqTabGroup',
    'KbqTab',
    'KbqTabHeader',
    'KbqTabNavBar',
    'KbqTabLink',
    'KbqTabLabelWrapper',
    'KbqTabBody'
].join('|');

const SUBCLASS = `\\bextends\\s+(?:${CLASSES})\\b`;

export const warnPatterns: WarnPattern[] = [
    {
        anchor: SUBCLASS,
        pattern: SUBCLASS,
        message:
            'A subclass of a Koobiq tabs class whose inputs became signal inputs. The bound value reaches the member ' +
            'from ngOnChanges now, which every one of them but KbqTab declares for the first time: an ngOnChanges of ' +
            'the subclass is marked override and calls super.ngOnChanges(changes). An input the subclass redeclared ' +
            'with @Input() is overridden through the `<member>Input` signal input instead, e.g. ' +
            '`override readonly headerPositionInput = input<KbqTabHeaderPosition | undefined>(undefined, ' +
            "{ alias: 'headerPosition' })`."
    },
    {
        anchor: SUBCLASS,
        pattern: '@(?:ViewChild|ViewChildren|ContentChild|ContentChildren)\\s*\\(',
        message:
            'A subclass of a Koobiq tabs class that declares a decorator query. KbqTabGroup.tabs, the items, ' +
            'tabListContainer, tabList, nextPaginator and previousPaginator of KbqTabHeader and KbqTabNavBar, ' +
            'KbqTabLabelWrapper.labelContent and KbqTab.templateLabel are getters over signal queries now, so a ' +
            'subclass can no longer redeclare them as fields: override the getter instead. tabs and items stay ' +
            'QueryLists whose changes emit as before.'
    },
    {
        anchor: `\\b(?:${CLASSES})\\b`,
        pattern: '(?<!\\bsuper)\\.ngOnChanges\\s*\\(',
        message:
            'A direct call of ngOnChanges in a file that uses a Koobiq tabs class. Their SimpleChanges are keyed by ' +
            'the `<member>Input` names now (disabledInput, not disabled), and a bound value reaches its member only ' +
            'through them: set the input with a template binding or ComponentRef.setInput instead. This pattern also ' +
            'matches ngOnChanges of an unrelated class in the same file — check before changing it.'
    }
];

export const SUMMARY = [
    'Reads and writes of the tabs members are unchanged, and tabs and items are still QueryLists. A boolean input',
    '(disabled, active, vertical, disablePagination) accepts boolean | string | null | undefined in a template now.'
];
