import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    KbqBreadcrumbView,
    KbqDefaultBreadcrumbStyler
} from '@koobiq/components/breadcrumbs';
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
            @for (section of abbreviations; track section; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="section.longText"
                    [queryParams]="{ queryParams: section }"
                    [fragment]="section.longText"
                    [text]="section.longText"
                >
                    <a *kbqBreadcrumbView>
                        <button
                            [attr.aria-current]="last ? 'page' : null"
                            [disabled]="last"
                            [kbqPlacementPriority]="PopUpPlacements.Bottom"
                            [kbqTooltipArrow]="false"
                            [kbqTooltip]="section.longText"
                            [kbqTooltipDisabled]="!section.shortText"
                            kbq-button
                            kbqBreadcrumb
                        >
                            {{ section.shortText || section.longText }}
                        </button>
                    </a>
                </kbq-breadcrumb-item>
            }
        </nav>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbs,
        KbqBreadcrumbItem,
        KbqDefaultBreadcrumbStyler,
        KbqBreadcrumbView,
        KbqButtonModule,
        KbqToolTipModule
    ]
})
export class BreadcrumbsTruncateByAbbrevItemsExample {
    abbreviations: { shortText?: string; longText: string }[] = [
        { longText: 'Main' },
        { longText: 'Reviews' },
        { longText: 'Advanced Encryption Standard', shortText: 'AES' }];
    protected readonly PopUpPlacements = PopUpPlacements;
}
