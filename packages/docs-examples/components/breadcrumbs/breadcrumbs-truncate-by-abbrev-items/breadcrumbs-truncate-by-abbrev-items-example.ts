import { Component } from '@angular/core';
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
            @for (navLink of navLinks; track navLink; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="navLink.longText"
                    [queryParams]="{ queryParams: navLink }"
                    [fragment]="navLink.longText"
                    [text]="navLink.longText"
                >
                    <a *kbqBreadcrumbView>
                        <button
                            [attr.aria-current]="last ? 'page' : null"
                            [disabled]="last"
                            [kbqPlacementPriority]="PopUpPlacements.Bottom"
                            [kbqTooltipArrow]="false"
                            [kbqTooltip]="navLink.longText"
                            [kbqTooltipDisabled]="!navLink.shortText"
                            kbq-button
                            kbqBreadcrumb
                        >
                            {{ navLink.shortText || navLink.longText }}
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
    ]
})
export class BreadcrumbsTruncateByAbbrevItemsExample {
    navLinks: { shortText?: string; longText: string }[] = [
        { longText: 'Main' },
        { longText: 'Reviews' },
        { longText: 'Advanced Encryption Standard', shortText: 'AES' }];
    protected readonly PopUpPlacements = PopUpPlacements;
}
