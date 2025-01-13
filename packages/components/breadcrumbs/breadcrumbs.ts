import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
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
    inject,
    InjectionToken,
    Input,
    OnInit,
    Provider,
    QueryList,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqDefaultSizes } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

export interface KbqBreadcrumbsConfiguration {
    /**
     * Specifies the maximum number of breadcrumb items to display.
     * - If a number is provided, only that many items will be shown.
     * - If `null`, no limit is applied, and all breadcrumb items are displayed.
     */
    max: number | null;
    size: KbqDefaultSizes;
}

export const KBQ_BREADCRUMBS_DEFAULT_CONFIGURATION: KbqBreadcrumbsConfiguration = {
    max: 4,
    size: 'normal'
};

/** Breadcrumbs options global configuration provider. */
export const KBQ_BREADCRUMBS_CONFIGURATION = new InjectionToken<KbqBreadcrumbsConfiguration>(
    'KBQ_BREADCRUMBS_CONFIGURATION',
    { factory: () => KBQ_BREADCRUMBS_DEFAULT_CONFIGURATION }
);

/** Utility provider for `KBQ_BREADCRUMBS_CONFIGURATION`. */
export const kbqBreadcrumbsConfigurationProvider = (configuration: KbqBreadcrumbsConfiguration): Provider => ({
    provide: KBQ_BREADCRUMBS_CONFIGURATION,
    useValue: configuration
});

@Directive({
    selector: '[kbqBreadcrumbsSeparator]',
    standalone: true
})
export class KbqBreadcrumbsSeparator {
    readonly templateRef = inject(TemplateRef);
}

/**
 * This directive is used to style breadcrumb buttons with default styling rules.
 *
 */
@Directive({
    standalone: true,
    hostDirectives: [RdxRovingFocusItemDirective],
    selector: '[kbq-button][kbqBreadcrumb]',
    host: { class: 'kbq-breadcrumb-item' }
})
export class KbqDefaultBreadcrumbStyler implements OnInit {
    button = inject(KbqButton, { optional: true, host: true });

    ngOnInit() {
        if (this.button) {
            this.button.color = KbqComponentColors.Contrast;
            this.button.kbqStyle = KbqButtonStyles.Transparent;
        }
    }
}

/**
 * Directive provides a way to define a custom template for breadcrumb rendering, leveraging TemplateRef
 */
@Directive({
    standalone: true,
    selector: '[kbqBreadcrumbView]'
})
export class KbqBreadcrumbView {
    templateRef = inject(TemplateRef);
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
    host: {
        class: 'kbq-breadcrumb-item'
    }
})
export class KbqBreadcrumbItem {
    @Input() text: string;
    @Input({ transform: booleanAttribute }) disabled: boolean;

    @ContentChild(KbqBreadcrumbView, { read: TemplateRef }) customTemplateRef: TemplateRef<any>;

    routerLink = inject(RouterLink, { optional: true, host: true });
}

@Component({
    standalone: true,
    selector: 'kbq-breadcrumbs,[kbq-breadcrumbs]',
    templateUrl: './breadcrumbs.html',
    styleUrls: ['./breadcrumbs.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        AsyncPipe,
        NgTemplateOutlet,
        RouterLink,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqBreadcrumbItem,
        KbqDefaultBreadcrumbStyler
    ],
    host: {
        '[class]': 'class',
        '[attr.aria-label]': "'breadcrumb'"
    },
    hostDirectives: [RdxRovingFocusGroupDirective]
})
export class KbqBreadcrumbs implements AfterContentInit {
    protected readonly configuration = inject(KBQ_BREADCRUMBS_CONFIGURATION);

    @Input()
    size: KbqDefaultSizes = this.configuration.size;

    @Input()
    max: number | null = this.configuration.max;

    @ContentChild(KbqBreadcrumbsSeparator, { read: TemplateRef })
    separator?: TemplateRef<any>;

    @ContentChildren(KbqBreadcrumbItem)
    items: QueryList<KbqBreadcrumbItem>;

    get class(): string[] {
        return [`kbq-breadcrumbs_${this.size}`];
    }

    private readonly destroyRef = inject(DestroyRef);
    private readonly cdr = inject(ChangeDetectorRef);
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;

    ngAfterContentInit() {
        this.items.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
    }
}
