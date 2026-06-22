import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    contentChild,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    input,
    OnInit,
    Provider,
    TemplateRef,
    viewChild,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqDefaultSizes, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KbqOverflowItem,
    KbqOverflowItems,
    KbqOverflowItemsModule,
    KbqOverflowItemsResult
} from '@koobiq/components/overflow-items';
import { KbqTitleModule } from '@koobiq/components/title';
import { EMPTY, merge, skip, switchMap } from 'rxjs';
import { KbqBreadcrumbsConfiguration, KbqBreadcrumbsWrapMode } from './breadcrumbs.types';
import { RdxRovingFocusGroupDirective } from './roving-focus-group.directive';
import { RdxRovingFocusItemDirective } from './roving-focus-item.directive';

const KBQ_BREADCRUMBS_DEFAULT_CONFIGURATION: KbqBreadcrumbsConfiguration = {
    max: 4,
    size: 'normal',
    firstItemNegativeMargin: true,
    wrapMode: 'auto'
};

/** Breadcrumbs options global configuration provider. */
export const KBQ_BREADCRUMBS_CONFIGURATION = new InjectionToken<KbqBreadcrumbsConfiguration>(
    'KBQ_BREADCRUMBS_CONFIGURATION',
    { factory: () => KBQ_BREADCRUMBS_DEFAULT_CONFIGURATION }
);

/** Utility provider for `KBQ_BREADCRUMBS_CONFIGURATION`. */
export const kbqBreadcrumbsConfigurationProvider = (configuration: Partial<KbqBreadcrumbsConfiguration>): Provider => ({
    provide: KBQ_BREADCRUMBS_CONFIGURATION,
    useValue: { ...KBQ_BREADCRUMBS_DEFAULT_CONFIGURATION, ...configuration }
});

@Directive({
    selector: 'ng-template[kbqBreadcrumbsSeparator]',
    host: {
        class: 'kbq-breadcrumbs-separator'
    }
})
export class KbqBreadcrumbsSeparator {
    readonly templateRef = inject(TemplateRef);
}

/**
 * Directive to style and configure buttons used as breadcrumb items.
 * - Inherits focus management behavior from `RdxRovingFocusItemDirective`.
 * - Optionally injects `KbqButton` to customize its style for breadcrumb usage.
 */
@Directive({
    selector: '[kbq-button][kbqBreadcrumb]',
    host: { class: 'kbq-breadcrumb-item' },
    hostDirectives: [
        {
            directive: RdxRovingFocusItemDirective,
            inputs: ['focusable']
        }
    ]
})
export class KbqBreadcrumbButton implements OnInit {
    private readonly button = inject(KbqButton, { optional: true, self: true });

    ngOnInit() {
        if (this.button) {
            this.button.color = KbqComponentColors.Contrast;
            this.button.kbqStyle = KbqButtonStyles.Transparent;
        }
    }
}

/**
 * Directive provides a way to define a custom template for breadcrumb rendering, leveraging TemplateRef
 *
 */
@Directive({
    selector: '[kbqBreadcrumbView]'
})
export class KbqBreadcrumbView {
    readonly templateRef = inject(TemplateRef);
}

/**
 * Component represents an individual breadcrumb item with optional support for router navigation and styling.
 */
@Component({
    selector: 'kbq-breadcrumb-item',
    template: `
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.tabIndex]': 'null'
    }
})
export class KbqBreadcrumbItem {
    /**
     * The text displayed for the breadcrumb item.
     * This text will be shown if breadcrumb item is hidden in dropdown.
     */
    readonly text = input<string>(undefined!);
    /**
     * Indicates whether the breadcrumb item is disabled.
     */
    readonly disabled = input<boolean, unknown>(undefined!, { transform: booleanAttribute });
    /**
     * Indicates whether the breadcrumb item is the current/active item.
     * Defaults to `false`.
     */
    readonly current = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * A reference to a custom template provided for the breadcrumb item content.
     * The template can be used to override the default appearance of the breadcrumb.
     */
    readonly customTemplateRef = contentChild(KbqBreadcrumbView, { read: TemplateRef });
    /**
     * An optional `RouterLink` instance for navigating to a specific route.
     * Injected from the host element, if available and projecting to the hidden breadcrumb item in dropdown.
     */
    readonly routerLink = inject(RouterLink, { optional: true, host: true });
}

@Component({
    selector: 'kbq-breadcrumbs,[kbq-breadcrumbs]',
    imports: [
        NgTemplateOutlet,
        RouterLink,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqBreadcrumbButton,
        KbqTitleModule,
        KbqOverflowItemsModule
    ],
    templateUrl: './breadcrumbs.html',
    styleUrls: ['./breadcrumbs.scss', './breadcrumbs-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-breadcrumbs',
        '[class.kbq-breadcrumbs_compact]': 'size() === "compact"',
        '[class.kbq-breadcrumbs_normal]': 'size() === "normal"',
        '[class.kbq-breadcrumbs_big]': 'size() === "big"',
        '[class.kbq-breadcrumbs_wrap]': 'wrapMode() === "wrap"',
        '[class.kbq-breadcrumbs_first-item-negative-margin]': 'firstItemNegativeMargin()',
        '[attr.aria-label]': "'breadcrumb'"
    },
    hostDirectives: [RdxRovingFocusGroupDirective]
})
export class KbqBreadcrumbs {
    protected readonly configuration = inject(KBQ_BREADCRUMBS_CONFIGURATION);
    /**
     * Determines if a negative margin should be applied to the first breadcrumb item.
     *
     * @see KbqBreadcrumbsConfiguration
     */
    readonly firstItemNegativeMargin = input<boolean, unknown>(this.configuration.firstItemNegativeMargin, {
        transform: booleanAttribute
    });
    /**
     * Size of the breadcrumbs. Affects font size.
     * Default value is taken from the global configuration.
     */
    readonly size = input<KbqDefaultSizes>(this.configuration.size);
    /**
     * Maximum number of visible breadcrumb items.
     * Remaining items are collapsed into a dropdown if the total exceeds this value.
     * Default value is taken from the global configuration.
     */
    readonly max = input<number | null>(this.configuration.max);
    /**
     * Indicates whether the breadcrumbs are disabled.
     * When disabled, user interactions are blocked.
     */
    readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Wrapping behavior of the breadcrumb items.
     */
    readonly wrapMode = input<KbqBreadcrumbsWrapMode>(this.configuration.wrapMode);

    @ContentChild(KbqBreadcrumbsSeparator, { read: TemplateRef })
    protected readonly separator?: TemplateRef<any>;

    protected readonly items = contentChildren<KbqBreadcrumbItem>(forwardRef(() => KbqBreadcrumbItem));

    private readonly breadcrumbsResult = viewChild('breadcrumbsResult', { read: ElementRef });
    private readonly result = viewChild(KbqOverflowItemsResult);
    private readonly overflowItems = viewChildren<KbqOverflowItem>(forwardRef(() => KbqOverflowItem));
    private readonly overflowItemsDir = viewChild(KbqOverflowItems);

    /**
     * Ensures at least minimum number of breadcrumb items are shown.
     */
    protected readonly minVisibleItems = 2;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;

    /** @docs-private */
    protected readonly itemsExcludingEdges = computed(() => this.items().slice(1, -1));
    protected readonly hiddenItemIDs = computed(
        () =>
            new Set(
                this.overflowItems()
                    .filter((item) => item.hidden())
                    .map((item) => item.id())
            )
    );

    /** @docs-private */
    protected readonly maxVisibleItems = computed((): number | null => {
        const max = this.max();
        const count = this.items().length;

        if (max === null || max >= count || max < this.minVisibleItems) return null;

        return max - 1;
    });

    private readonly maxHiddenItems = new Set<KbqOverflowItem>();

    constructor() {
        const group = inject(RdxRovingFocusGroupDirective, { self: true });

        group.orientation = 'horizontal';

        merge(
            toObservable(this.overflowItemsDir).pipe(
                switchMap((dir) => (dir ? outputToObservable(dir.changes) : EMPTY))
            ),
            toObservable(this.max).pipe(skip(1))
        )
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.enforceMaxVisible());

        effect(() => {
            const focusableItems = group.focusableItems();
            const expandButton = this.breadcrumbsResult()?.nativeElement;

            if (focusableItems.length < 2 || focusableItems[0] !== expandButton) return;

            const [first, second, ...rest] = focusableItems;

            group.focusableItems.set([second, first, ...rest]);
        });
    }

    private enforceMaxVisible(): void {
        const max = this.maxVisibleItems();
        const items = this.overflowItems();
        const result = this.result();
        const overflowHiddenIds = this.overflowItemsDir()?.hiddenItemIDs() ?? new Set();

        this.maxHiddenItems.forEach((item) => {
            if (!overflowHiddenIds.has(item.id())) {
                item.show();
            }
        });
        this.maxHiddenItems.clear();

        const allVisibleItems = items
            .map((item, index) => ({ item, order: item.order() ?? index }))
            .filter(({ item }) => !item.hidden());

        const extraToHide = max === null ? 0 : allVisibleItems.length - max;

        const hideResultIfAllVisible = () => {
            if (allVisibleItems.length === items.length) {
                result?.hide();
            }
        };

        if (extraToHide <= 0) {
            hideResultIfAllVisible();

            return;
        }

        const hideable = allVisibleItems
            .filter(({ item }) => !item.alwaysVisible())
            .sort((a, b) => a.order - b.order)
            .map(({ item }) => item);

        for (let i = 0; i < extraToHide && i < hideable.length; i++) {
            hideable[i].hide();
            this.maxHiddenItems.add(hideable[i]);
            result?.show();
        }
    }
}
