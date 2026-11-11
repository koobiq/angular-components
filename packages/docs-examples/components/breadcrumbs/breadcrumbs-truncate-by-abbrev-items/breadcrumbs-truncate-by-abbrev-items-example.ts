import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from './l10n';

/**
 * @title Breadcrumbs Truncate By Abbreviation Items
 */
@Component({
    selector: 'breadcrumbs-truncate-by-abbrev-items-example',
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <nav kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs(); track breadcrumb) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb.url"
                    [queryParams]="{ queryParams: breadcrumb }"
                    [fragment]="breadcrumb.longText"
                    [text]="breadcrumb.longText"
                >
                    <a *kbqBreadcrumbView tabindex="-1" [routerLink]="breadcrumb.url">
                        <button
                            kbq-button
                            kbqBreadcrumb
                            [attr.aria-current]="$last ? 'page' : null"
                            [disabled]="$last"
                            [kbqPlacementPriority]="PopUpPlacements.Bottom"
                            [kbqTooltipArrow]="false"
                            [kbqTooltip]="breadcrumb.longText"
                            [kbqTooltipDisabled]="!breadcrumb.shortText"
                        >
                            {{ breadcrumb.shortText || breadcrumb.longText }}
                        </button>
                    </a>
                </kbq-breadcrumb-item>
            }
        </nav>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateByAbbrevItemsExample {
    protected readonly text = injectExampleText();

    readonly breadcrumbs = computed(() => [
        { longText: this.text().main, url: '/main' },
        { longText: this.text().reviews, url: '/main/reviews' },
        { longText: this.text().aes, shortText: 'AES', url: '/main/reviews/advanced-encryption-standard' }
    ]);
    protected readonly PopUpPlacements = PopUpPlacements;
}
