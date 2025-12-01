import { NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    Input,
    OnInit,
    Provider,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqDefaultSizes, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItem, KbqOverflowItemsModule, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { KbqTitleModule } from '@koobiq/components/title';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { KbqBreadcrumbsConfiguration, KbqBreadcrumbsWrapMode } from './breadcrumbs.types';

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
    standalone: true,
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
    standalone: true,
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
    standalone: true,
    selector: '[kbqBreadcrumbView]'
})
export class KbqBreadcrumbView {
    readonly templateRef = inject(TemplateRef);
}

/**
 * Component represents an individual breadcrumb item with optional support for router navigation and styling.
 */
@Component({
    standalone: true,
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
    @Input() text: string;
    /**
     * Indicates whether the breadcrumb item is disabled.
     */
    @Input({ transform: booleanAttribute }) disabled: boolean;
    /**
     * Indicates whether the breadcrumb item is the current/active item.
     * Defaults to `false`.
     */
    @Input({ transform: booleanAttribute }) current: boolean = false;
    /**
     * A reference to a custom template provided for the breadcrumb item content.
     * The template can be used to override the default appearance of the breadcrumb.
     */
    @ContentChild(KbqBreadcrumbView, { read: TemplateRef }) customTemplateRef: TemplateRef<any>;
    /**
     * An optional `RouterLink` instance for navigating to a specific route.
     * Injected from the host element, if available and projecting to the hidden breadcrumb item in dropdown.
     */
    readonly routerLink = inject(RouterLink, { optional: true, host: true });
}

@Component({
    standalone: true,
    selector: 'kbq-breadcrumbs,[kbq-breadcrumbs]',
    templateUrl: './breadcrumbs.html',
    styleUrls: ['./breadcrumbs.scss', './breadcrumbs-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
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
    host: {
        class: 'kbq-breadcrumbs',
        '[class.kbq-breadcrumbs_compact]': 'size === "compact"',
        '[class.kbq-breadcrumbs_normal]': 'size === "normal"',
        '[class.kbq-breadcrumbs_big]': 'size === "big"',
        '[class.kbq-breadcrumbs_wrap]': 'wrapMode === "wrap"',
        '[class.kbq-breadcrumbs_first-item-negative-margin]': 'firstItemNegativeMargin',
        '[attr.aria-label]': "'breadcrumb'"
    },
    hostDirectives: [RdxRovingFocusGroupDirective]
})
export class KbqBreadcrumbs implements AfterContentInit {
    protected readonly configuration = inject(KBQ_BREADCRUMBS_CONFIGURATION);
    /**
     * Determines if a negative margin should be applied to the first breadcrumb item.
     *
     * @see KbqBreadcrumbsConfiguration
     */
    @Input({ transform: booleanAttribute }) firstItemNegativeMargin: boolean =
        this.configuration.firstItemNegativeMargin;
    /**
     * Size of the breadcrumbs. Affects font size.
     * Default value is taken from the global configuration.
     */
    @Input() size: KbqDefaultSizes = this.configuration.size;
    /**
     * Maximum number of visible breadcrumb items.
     * Remaining items are collapsed into a dropdown if the total exceeds this value.
     * Default value is taken from the global configuration.
     */
    @Input() max: number | null = this.configuration.max;
    /**
     * Indicates whether the breadcrumbs are disabled.
     * When disabled, user interactions are blocked.
     */
    @Input({ transform: booleanAttribute }) disabled: boolean = false;
    /**
     * Wrapping behavior of the breadcrumb items.
     */
    @Input() wrapMode: KbqBreadcrumbsWrapMode = this.configuration.wrapMode;

    @ContentChild(KbqBreadcrumbsSeparator, { read: TemplateRef })
    protected readonly separator?: TemplateRef<any>;

    @ContentChildren(forwardRef(() => KbqBreadcrumbItem))
    protected readonly items: QueryList<KbqBreadcrumbItem>;

    @ViewChild(KbqOverflowItemsResult, { read: ElementRef })
    private readonly result: ElementRef;

    @ViewChildren(KbqOverflowItem, { read: ElementRef })
    private readonly overflowItems: QueryList<ElementRef>;

    /**
     * Ensures at least minimum number of breadcrumb items are shown.
     */
    protected readonly minVisibleItems = 2;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);

    /** @docs-private */
    protected get itemsExcludingEdges() {
        return this.items.toArray().slice(1, -1);
    }

    /**
     * Calculates the total width of visible items based on the `max` value and overflow items.
     * @returns {number | null} The computed max width for overflow items or null if conditions are not met.
     * @docs-private
     */
    protected get maxWidth(): number | null {
        if (
            !this.overflowItems ||
            !this.overflowItems.length ||
            this.max === null ||
            this.max >= this.items.length ||
            this.max < this.minVisibleItems
        ) {
            return null;
        }

        let visibleItemsWidth = this.getItemWidth(this.result);
        // Reorders overflow items to prioritize the first and last elements
        const sortedItems = [
            ...this.overflowItems.toArray().slice(1, -1),
            this.overflowItems.first,
            this.overflowItems.last
        ];

        for (let i = 0; i < this.max - 1; i++) {
            visibleItemsWidth += this.getItemWidth(sortedItems[sortedItems.length - i - 1]);
        }

        return visibleItemsWidth;
    }

    constructor() {
        inject(RdxRovingFocusGroupDirective, { self: true }).orientation = 'horizontal';
    }

    ngAfterContentInit() {
        this.items.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
    }

    private getItemWidth(item?: ElementRef) {
        return item ? item.nativeElement.offsetWidth : 0;
    }
}
