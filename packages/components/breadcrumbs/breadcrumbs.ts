import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
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
    'KBQ_CODE_BLOCK_LOCALE_CONFIGURATION',
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

@Directive({
    standalone: true,
    selector: '[kbq-button][kbqBreadcrumb]'
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

@Directive({
    standalone: true,
    selector: '[kbqBreadcrumbItem]'
})
export class KbqBreadcrumbItem {
    templateRef = inject(TemplateRef);
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
        KbqIconModule,
        KbqButtonModule,
        RdxRovingFocusItemDirective,
        RouterLink,
        NgTemplateOutlet,
        KbqDropdownModule
    ],
    host: {
        '[class]': 'class',
        '[attr.aria-label]': "'breadcrumb'"
    },
    hostDirectives: [RdxRovingFocusGroupDirective]
})
export class KbqBreadcrumbs {
    protected readonly options = inject(KBQ_BREADCRUMBS_CONFIGURATION);

    @ContentChildren(KbqBreadcrumbItem)
    items: QueryList<KbqBreadcrumbItem>;

    @ContentChild(KbqBreadcrumbsSeparator, { read: TemplateRef })
    separator?: TemplateRef<any>;

    @Input()
    size: KbqDefaultSizes = this.options.size;

    @Input()
    max: number | null = this.options.max;

    get class(): string[] {
        return [`kbq-breadcrumbs_${this.size}`];
    }

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}
