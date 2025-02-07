import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Breadcrumbs Truncate By Abbreviation Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-by-abbrev-items-example',
    template: `
        <nav kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb.url"
                    [queryParams]="{ queryParams: breadcrumb }"
                    [fragment]="breadcrumb.longText"
                    [text]="breadcrumb.longText"
                >
                    <a *kbqBreadcrumbView [routerLink]="breadcrumb.url" tabindex="-1">
                        <button
                            [attr.aria-current]="last ? 'page' : null"
                            [disabled]="last"
                            [kbqPlacementPriority]="PopUpPlacements.Bottom"
                            [kbqTooltipArrow]="false"
                            [kbqTooltip]="breadcrumb.longText"
                            [kbqTooltipDisabled]="!breadcrumb.shortText"
                            kbq-button
                            kbqBreadcrumb
                        >
                            {{ breadcrumb.shortText || breadcrumb.longText }}
                        </button>
                    </a>
                </kbq-breadcrumb-item>
            }
        </nav>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqButtonModule,
        KbqToolTipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateByAbbrevItemsExample {
    breadcrumbs = [
        { longText: 'Main', url: '/main' },
        { longText: 'Reviews', url: '/main/reviews' },
        {
            longText: 'Advanced Encryption Standard',
            shortText: 'AES',
            url: '/main/reviews/advanced-encryption-standard'
        }
    ];
    protected readonly PopUpPlacements = PopUpPlacements;
}
