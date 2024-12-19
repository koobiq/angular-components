import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    forwardRef,
    inject,
    InjectionToken,
    Input,
    Provider,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqDefaultSizes } from '@koobiq/components/core';
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
    selector: '[kbqBreadcrumb]',
    hostDirectives: [
        RdxRovingFocusItemDirective
    ],
    host: {
        class: 'kbq-breadcrumb',
        '[attr.aria-current]': `last ? 'page' : null`
    }
})
export class KbqBreadcrumbBehavior {
    @Input() last = false;
    button = inject(KbqButton, { optional: true, host: true });

    constructor() {
        if (this.button) {
            this.button.color = KbqComponentColors.Contrast;
            this.button.kbqStyle = KbqButtonStyles.Transparent;
        }
    }
}

/**
 * Component used to output
 */
@Component({
    selector: 'breadcrumb-item',
    template: `
        <ng-template #breadcrumbTemplate>
            <ng-content />
        </ng-template>
    `,
    standalone: true
})
export class BreadcrumbItem {
    @ViewChild('breadcrumbTemplate') templateRef!: TemplateRef<any>;
    routerLink: RouterLink | null = inject(RouterLink, { optional: true, host: true });
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
        NgTemplateOutlet
    ],
    host: {
        '[class]': 'class',
        '[attr.aria-label]': "'breadcrumb'"
    },
    hostDirectives: [RdxRovingFocusGroupDirective]
})
export class KbqBreadcrumbs {
    protected readonly options = inject(KBQ_BREADCRUMBS_CONFIGURATION);

    @ContentChildren(forwardRef(() => BreadcrumbItem))
    items: QueryList<BreadcrumbItem>;

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
