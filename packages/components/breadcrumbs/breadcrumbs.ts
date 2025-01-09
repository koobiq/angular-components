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
    max: number | null;
    size: KbqDefaultSizes;
    separator?: string;
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
    host: { class: 'kbq-breadcrumb' }
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
 * Directive represents an individual breadcrumb item with optional support for router navigation and styling.
 */
@Directive({
    standalone: true,
    selector: 'kbq-breadcrumb-item',
    host: {
        class: 'kbq-breadcrumb'
    }
})
export class KbqBreadcrumb {
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
        KbqBreadcrumb,
        KbqDefaultBreadcrumbStyler
    ],
    host: {
        '[class]': 'class',
        '[attr.aria-label]': "'breadcrumb'"
    },
    hostDirectives: [RdxRovingFocusGroupDirective]
})
export class KbqBreadcrumbs implements AfterContentInit {
    protected readonly options = inject(KBQ_BREADCRUMBS_CONFIGURATION);
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly cdr = inject(ChangeDetectorRef);

    @Input()
    size: KbqDefaultSizes = this.options.size;

    @Input()
    max: number | null = this.options.max;

    @ContentChild(KbqBreadcrumbsSeparator, { read: TemplateRef })
    separator?: TemplateRef<any>;

    @ContentChildren(KbqBreadcrumb)
    items: QueryList<KbqBreadcrumb>;

    get class(): string[] {
        return [`kbq-breadcrumbs_${this.size}`];
    }

    ngAfterContentInit() {
        this.items.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
    }

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}
