import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbItem, KbqBreadcrumbs } from '@koobiq/components/breadcrumbs';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Breadcrumbs Truncate Tail Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-tail-items-example',
    template: `
        <nav class="kbq-breadcrumbs_truncate-last-by-length-reverse" kbq-breadcrumbs>
            @for (link of navLinks; track link) {
                <kbq-breadcrumb-item
                    [routerLink]="link"
                    [queryParams]="{ queryParams: link }"
                    [fragment]="link"
                    [text]="link"
                />
            }
        </nav>
    `,
    styleUrls: ['breadcrumbs-truncate-tail-items-example.scss'],
    imports: [
        RouterLink,
        KbqBreadcrumbs,
        KbqBreadcrumbItem
    ]
})
export class BreadcrumbsTruncateTailItemsExample {
    navLinks = ['Main', 'Users', 'Report №123456789'];
    protected readonly PopUpPlacements = PopUpPlacements;
}
