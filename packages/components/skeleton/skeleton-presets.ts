import {
    ChangeDetectionStrategy,
    Component,
    InjectionToken,
    Provider,
    ViewEncapsulation,
    booleanAttribute,
    computed,
    inject,
    input,
    numberAttribute
} from '@angular/core';
import { KbqSkeleton } from './skeleton';

/** Numbers of items the skeleton presets show until the amount of data is known. */
export interface KbqSkeletonPresetsConfiguration {
    /** Number of lines of `kbq-skeleton-typography`. */
    typographyLines: number;
    /** Number of rows of `kbq-skeleton-dl`. */
    dlRows: number;
    /** Number of rows of `kbq-skeleton-table`. */
    tableRows: number;
    /** Number of columns of `kbq-skeleton-table`. */
    tableColumns: number;
    /** Number of placeholders of `kbq-skeleton-group`. */
    groupCount: number;
    /** Number of collapsed items of `kbq-skeleton-accordion`. */
    accordionRows: number;
    /** Number of controls of `kbq-skeleton-checkable`. */
    checkableRows: number;
    /** Number of tabs of `kbq-skeleton-tabs`. */
    tabsCount: number;
    /** Number of lines of the text in the content of `kbq-skeleton-tabs`. */
    tabsContentLines: number;
    /** Number of top-level nodes of `kbq-skeleton-tree`. */
    treeRows: number;
    /** Number of children of the expanded node of `kbq-skeleton-tree`. */
    treeChildren: number;
}

const KBQ_SKELETON_PRESETS_DEFAULT_CONFIGURATION: KbqSkeletonPresetsConfiguration = {
    typographyLines: 1,
    dlRows: 3,
    tableRows: 3,
    tableColumns: 3,
    groupCount: 3,
    accordionRows: 3,
    checkableRows: 1,
    tabsCount: 3,
    tabsContentLines: 3,
    treeRows: 3,
    treeChildren: 3
};

/** Numbers of items of the skeleton presets. */
export const KBQ_SKELETON_PRESETS_CONFIGURATION = new InjectionToken<KbqSkeletonPresetsConfiguration>(
    'KBQ_SKELETON_PRESETS_CONFIGURATION',
    { factory: () => KBQ_SKELETON_PRESETS_DEFAULT_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_SKELETON_PRESETS_CONFIGURATION`, for an application or a part of it. The keys it leaves
 * out keep the values of the closest provider above.
 */
export const kbqSkeletonPresetsConfigurationProvider = (
    configuration: Partial<KbqSkeletonPresetsConfiguration>
): Provider => ({
    provide: KBQ_SKELETON_PRESETS_CONFIGURATION,
    useFactory: (): KbqSkeletonPresetsConfiguration => ({
        ...KBQ_SKELETON_PRESETS_DEFAULT_CONFIGURATION,
        ...inject(KBQ_SKELETON_PRESETS_CONFIGURATION, { skipSelf: true, optional: true }),
        ...configuration
    })
});

/** Indexes of `count` items, for a `@for` that repeats a placeholder; a single one for a count that is not a number. */
const range = (count: number): number[] =>
    Array.from({ length: Number.isFinite(count) ? count : 1 }, (_, index) => index);

/** Placeholder of a button whose data has not loaded yet. */
@Component({
    selector: 'kbq-skeleton-button',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-skeleton-button' },
    hostDirectives: [KbqSkeleton]
})
export class KbqSkeletonButton {}

/** Placeholder of a badge whose data has not loaded yet. */
@Component({
    selector: 'kbq-skeleton-badge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-skeleton-badge' },
    hostDirectives: [KbqSkeleton]
})
export class KbqSkeletonBadge {}

/** Placeholder of a tag whose data has not loaded yet. */
@Component({
    selector: 'kbq-skeleton-tag',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-skeleton-tag' },
    hostDirectives: [KbqSkeleton]
})
export class KbqSkeletonTag {}

/** Placeholder of an icon or an icon button whose data has not loaded yet. */
@Component({
    selector: 'kbq-skeleton-icon',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-skeleton-icon' },
    hostDirectives: [KbqSkeleton]
})
export class KbqSkeletonIcon {}

/** Placeholder of a link whose data has not loaded yet. */
@Component({
    selector: 'kbq-skeleton-link',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-skeleton-link' },
    hostDirectives: [KbqSkeleton]
})
export class KbqSkeletonLink {}

/**
 * Placeholder of text that has not loaded yet: lines as tall as the lines of its typography level, a line of body text
 * by default. A single line, such as a heading, is shorter than the lines of a paragraph, which differ in length.
 */
@Component({
    selector: 'kbq-skeleton-typography',
    imports: [KbqSkeleton],
    template: `
        @for (line of lineList(); track line) {
            <div kbqSkeleton class="kbq-skeleton-typography__line"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-skeleton-typography',
        '[class]': 'levelClass()'
    }
})
export class KbqSkeletonTypography {
    private readonly configuration = inject(KBQ_SKELETON_PRESETS_CONFIGURATION);

    /** Typography level of the text, the name of its class without `kbq-`, such as `title` or `caps-compact`. */
    readonly level = input('text-normal');

    /** Number of lines, `typographyLines` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default. */
    readonly lines = input<number, number | string>(this.configuration.typographyLines, {
        transform: numberAttribute
    });

    protected readonly lineList = computed(() => range(this.lines()));
    protected readonly levelClass = computed(() => `kbq-${this.level()}`);
}

/** Placeholder of a description list whose data has not loaded yet. */
@Component({
    selector: 'kbq-skeleton-dl',
    imports: [KbqSkeleton],
    template: `
        @for (row of rowList(); track row) {
            <div kbqSkeleton class="kbq-skeleton-dl__term"></div>
            <div kbqSkeleton class="kbq-skeleton-dl__description"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-skeleton-dl' }
})
export class KbqSkeletonDl {
    private readonly configuration = inject(KBQ_SKELETON_PRESETS_CONFIGURATION);

    /** Number of terms with their descriptions, `dlRows` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default. */
    readonly rows = input<number, number | string>(this.configuration.dlRows, { transform: numberAttribute });

    protected readonly rowList = computed(() => range(this.rows()));
}

const equalColumns = (count: number): readonly string[] => range(count).map(() => 'minmax(0, 1fr)');

const toColumns = (value: number | string | readonly string[]): readonly string[] =>
    typeof value === 'object' ? value : equalColumns(numberAttribute(value));

/** Placeholder of a table whose data has not loaded yet. */
@Component({
    selector: 'kbq-skeleton-table',
    imports: [KbqSkeleton],
    template: `
        @if (header()) {
            @if (selectable()) {
                <div
                    class="kbq-skeleton-table__cell kbq-skeleton-table__cell_header kbq-skeleton-table__cell_selection"
                >
                    <div kbqSkeleton></div>
                </div>
            }
            @for (column of columns(); track $index) {
                <div
                    class="kbq-skeleton-table__cell kbq-skeleton-table__cell_header"
                    [class.kbq-skeleton-table__cell_pinned-edge]="$index === pinnedColumns() - 1"
                >
                    <div kbqSkeleton></div>
                </div>
            }
        }
        @for (row of rowList(); track row) {
            @if (selectable()) {
                <div class="kbq-skeleton-table__cell kbq-skeleton-table__cell_selection">
                    <div kbqSkeleton></div>
                </div>
            }
            @for (column of columns(); track $index) {
                <div
                    class="kbq-skeleton-table__cell"
                    [class.kbq-skeleton-table__cell_pinned-edge]="$index === pinnedColumns() - 1"
                >
                    <div kbqSkeleton></div>
                </div>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-skeleton-table',
        '[style.grid-template-columns]': 'gridTemplateColumns()'
    }
})
export class KbqSkeletonTable {
    private readonly configuration = inject(KBQ_SKELETON_PRESETS_CONFIGURATION);

    /** Number of rows below the header, `tableRows` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default. */
    readonly rows = input<number, number | string>(this.configuration.tableRows, { transform: numberAttribute });

    /**
     * Number of columns of equal width, `tableColumns` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default, or the
     * width of every column as a CSS grid track, such as `160px`, `1fr` or `auto`, for a table whose columns are known.
     */
    readonly columns = input(equalColumns(this.configuration.tableColumns), { transform: toColumns });

    /** Whether the table has a header row. */
    readonly header = input<boolean, boolean | string>(true, { transform: booleanAttribute });

    /** Whether every row starts with a checkbox, as in a grid whose rows can be selected. */
    readonly selectable = input<boolean, boolean | string>(false, { transform: booleanAttribute });

    /** Number of columns pinned to the start and set apart from the rest by a line, as in a grid. */
    readonly pinnedColumns = input<number, number | string>(0, { transform: numberAttribute });

    protected readonly rowList = computed(() => range(this.rows()));
    protected readonly gridTemplateColumns = computed(() =>
        [...(this.selectable() ? ['var(--kbq-skeleton-table-selection-width)'] : []), ...this.columns()].join(' ')
    );
}

/** Placeholder a group repeats in a row. */
export type KbqSkeletonGroupPreset = 'button' | 'badge' | 'tag' | 'icon' | 'link';

/** Row of placeholders of one kind, such as the tags of a tag list. */
@Component({
    selector: 'kbq-skeleton-group',
    imports: [KbqSkeletonButton, KbqSkeletonBadge, KbqSkeletonTag, KbqSkeletonIcon, KbqSkeletonLink],
    template: `
        @for (item of itemList(); track item) {
            @switch (preset()) {
                @case ('button') {
                    <kbq-skeleton-button />
                }
                @case ('badge') {
                    <kbq-skeleton-badge />
                }
                @case ('tag') {
                    <kbq-skeleton-tag />
                }
                @case ('icon') {
                    <kbq-skeleton-icon />
                }
                @case ('link') {
                    <kbq-skeleton-link />
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-skeleton-group',
        '[class]': 'presetClass()'
    }
})
export class KbqSkeletonGroup {
    private readonly configuration = inject(KBQ_SKELETON_PRESETS_CONFIGURATION);

    /** Placeholder of every item of the row. */
    readonly preset = input.required<KbqSkeletonGroupPreset>();

    /** Number of placeholders, `groupCount` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default. */
    readonly count = input<number, number | string>(this.configuration.groupCount, { transform: numberAttribute });

    protected readonly itemList = computed(() => range(this.count()));
    protected readonly presetClass = computed(() => `kbq-skeleton-group_${this.preset()}`);
}

/** Control a form field placeholder stands in for. */
export type KbqSkeletonFormFieldControl = 'input' | 'textarea';

/** Placeholder of a form field whose value has not loaded yet: its label, control and hint. */
@Component({
    selector: 'kbq-skeleton-form-field',
    imports: [KbqSkeleton],
    template: `
        @if (label()) {
            <div class="kbq-skeleton-form-field__label" [class]="labelClass()">
                <div kbqSkeleton></div>
            </div>
        }
        <div class="kbq-skeleton-form-field__content" [class]="contentClass()">
            <div kbqSkeleton class="kbq-skeleton-form-field__control"></div>
            @if (hint()) {
                <div kbqSkeleton class="kbq-skeleton-form-field__hint"></div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-skeleton-form-field',
        '[class.kbq-skeleton-form-field_horizontal]': 'horizontal()',
        '[class.kbq-skeleton-form-field_textarea]': 'control() === "textarea"'
    }
})
export class KbqSkeletonFormField {
    /** Whether the label is to the left of the control, as in a horizontal `kbq-form-field`. */
    readonly horizontal = input<boolean, boolean | string>(false, { transform: booleanAttribute });

    /** Control of the form field. */
    readonly control = input<KbqSkeletonFormFieldControl>('input');

    /** Whether the form field has a label, as a `kbq-form-field` with `kbq-label`. */
    readonly label = input<boolean, boolean | string>(true, { transform: booleanAttribute });

    /** Whether the form field has a hint below the control. */
    readonly hint = input<boolean, boolean | string>(false, { transform: booleanAttribute });

    /** Classes of the label, such as the `labelClass` of the `kbq-form-field` the placeholder stands in for. */
    readonly labelClass = input<string | string[] | Set<string>>();

    /** Classes of the control and the hint, such as the `contentClass` of the `kbq-form-field`. */
    readonly contentClass = input<string | string[] | Set<string>>();
}

/** Placeholder of an accordion whose items have not loaded yet: collapsed items with their icon and title. */
@Component({
    selector: 'kbq-skeleton-accordion',
    imports: [KbqSkeleton],
    template: `
        @for (row of rowList(); track row) {
            <div class="kbq-skeleton-accordion__item">
                <div kbqSkeleton class="kbq-skeleton-accordion__icon"></div>
                <div kbqSkeleton class="kbq-skeleton-accordion__title"></div>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-skeleton-accordion' }
})
export class KbqSkeletonAccordion {
    private readonly configuration = inject(KBQ_SKELETON_PRESETS_CONFIGURATION);

    /** Number of collapsed items, `accordionRows` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default. */
    readonly rows = input<number, number | string>(this.configuration.accordionRows, { transform: numberAttribute });

    protected readonly rowList = computed(() => range(this.rows()));
}

/** Control a checkable placeholder stands in for. */
export type KbqSkeletonCheckableControl = 'checkbox' | 'radio' | 'toggle';

/**
 * Placeholder of checkboxes, radio buttons or toggles whose data has not loaded yet: the control, and the label with
 * its hint on demand.
 */
@Component({
    selector: 'kbq-skeleton-checkable',
    imports: [KbqSkeleton],
    template: `
        @for (row of rowList(); track row) {
            <div class="kbq-skeleton-checkable__row">
                <div kbqSkeleton class="kbq-skeleton-checkable__control"></div>
                @if (label()) {
                    <div class="kbq-skeleton-checkable__text">
                        <div kbqSkeleton class="kbq-skeleton-checkable__label"></div>
                        @if (hint()) {
                            <div kbqSkeleton class="kbq-skeleton-checkable__hint"></div>
                        }
                    </div>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-skeleton-checkable',
        '[class]': 'controlClass()'
    }
})
export class KbqSkeletonCheckable {
    private readonly configuration = inject(KBQ_SKELETON_PRESETS_CONFIGURATION);

    /** Control the placeholder stands in for. */
    readonly control = input<KbqSkeletonCheckableControl>('checkbox');

    /** Number of controls, `checkableRows` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default. */
    readonly rows = input<number, number | string>(this.configuration.checkableRows, { transform: numberAttribute });

    /** Whether a control has a label. */
    readonly label = input<boolean, boolean | string>(true, { transform: booleanAttribute });

    /** Whether the label has a hint below it. */
    readonly hint = input<boolean, boolean | string>(false, { transform: booleanAttribute });

    protected readonly rowList = computed(() => range(this.rows()));
    protected readonly controlClass = computed(() => `kbq-skeleton-checkable_${this.control()}`);
}

/**
 * Placeholder of tabs whose data has not loaded yet: the first tab stands out as the selected one. The content below
 * or beside them is text, or the placeholders projected into the component.
 */
@Component({
    selector: 'kbq-skeleton-tabs',
    imports: [KbqSkeleton, KbqSkeletonTypography],
    template: `
        <div class="kbq-skeleton-tabs__header">
            @for (tab of tabList(); track tab) {
                <div class="kbq-skeleton-tabs__tab" [class.kbq-skeleton-tabs__tab_selected]="tab === 0">
                    <div kbqSkeleton></div>
                </div>
            }
        </div>
        <div class="kbq-skeleton-tabs__content">
            <ng-content>
                <kbq-skeleton-typography [lines]="contentLines()" />
            </ng-content>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-skeleton-tabs',
        '[class.kbq-skeleton-tabs_vertical]': 'vertical()'
    }
})
export class KbqSkeletonTabs {
    private readonly configuration = inject(KBQ_SKELETON_PRESETS_CONFIGURATION);

    /** Whether the tabs are stacked beside the content, as in a vertical `kbq-tab-group`. */
    readonly vertical = input<boolean, boolean | string>(false, { transform: booleanAttribute });

    /** Number of tabs, `tabsCount` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default. */
    readonly count = input<number, number | string>(this.configuration.tabsCount, { transform: numberAttribute });

    /**
     * Number of lines of the text that stands for the content when nothing is projected, `tabsContentLines` of
     * `KBQ_SKELETON_PRESETS_CONFIGURATION` by default.
     */
    readonly contentLines = input<number, number | string>(this.configuration.tabsContentLines, {
        transform: numberAttribute
    });

    protected readonly tabList = computed(() => range(this.count()));
}

/** Placeholder of a tree whose nodes have not loaded yet, with the second node expanded. */
@Component({
    selector: 'kbq-skeleton-tree',
    imports: [KbqSkeleton],
    template: `
        @for (row of rowList(); track row) {
            <div class="kbq-skeleton-tree__node kbq-skeleton-tree__node_{{ (row % 3) + 1 }}">
                <div kbqSkeleton class="kbq-skeleton-tree__toggle"></div>
                <div kbqSkeleton class="kbq-skeleton-tree__label"></div>
            </div>
            @if (row === 1) {
                @for (child of childList(); track child) {
                    <div
                        class="kbq-skeleton-tree__node kbq-skeleton-tree__node_nested kbq-skeleton-tree__node_{{
                            (child % 3) + 1
                        }}"
                    >
                        <div kbqSkeleton class="kbq-skeleton-tree__toggle"></div>
                        <div kbqSkeleton class="kbq-skeleton-tree__label"></div>
                    </div>
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-skeleton-tree' }
})
export class KbqSkeletonTree {
    private readonly configuration = inject(KBQ_SKELETON_PRESETS_CONFIGURATION);

    /** Number of top-level nodes, `treeRows` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by default. */
    readonly rows = input<number, number | string>(this.configuration.treeRows, { transform: numberAttribute });

    /**
     * Number of children of the expanded second node, `treeChildren` of `KBQ_SKELETON_PRESETS_CONFIGURATION` by
     * default.
     */
    readonly children = input<number, number | string>(this.configuration.treeChildren, {
        transform: numberAttribute
    });

    protected readonly rowList = computed(() => range(this.rows()));
    protected readonly childList = computed(() => range(this.children()));
}
