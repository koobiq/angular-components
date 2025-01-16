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
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Breadcrumbs Truncate Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-items-example',
    styleUrls: ['breadcrumbs-truncate-items-example.scss'],
    template: `
        <h3 class="kbq-text-big">Head truncation</h3>
        <nav class="kbq-breadcrumbs_truncate-by-length" [max]="4" kbq-breadcrumbs>
            @for (section of data; track section; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="section"
                    [queryParams]="{ queryParams: section }"
                    [fragment]="section"
                    [text]="section"
                />
            }
        </nav>

        <h3 class="kbq-text-big">Tail truncation</h3>

        <nav class="kbq-breadcrumbs_truncate-last-by-length-reverse" [max]="4" kbq-breadcrumbs>
            @for (section of dataEnd; track section; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="section"
                    [queryParams]="{ queryParams: section }"
                    [fragment]="section"
                    [text]="section"
                />
            }
        </nav>

        <h3 class="kbq-text-big">Abbreviations</h3>

        <nav [max]="4" kbq-breadcrumbs>
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
        KbqBreadcrumbs,
        RouterLink,
        KbqBreadcrumbItem,
        KbqButtonModule,
        KbqDefaultBreadcrumbStyler,
        KbqIcon,
        KbqTitleModule,
        KbqToolTipModule,
        KbqBreadcrumbView
    ]
})
export class BreadcrumbsTruncateItemsExample {
    data = ['Main', 'Upper-level system', 'Users'];

    dataEnd = ['Main', 'Users', 'Report №123456789'];

    abbreviations: { shortText?: string; longText: string }[] = [
        { longText: 'Main' },
        { longText: 'Reviews' },
        { longText: 'Advanced Encryption Standard', shortText: 'AES' }];
    protected readonly PopUpPlacements = PopUpPlacements;
}
