import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbItem, KbqBreadcrumbs } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs Truncate Head Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-head-items-example',
    styleUrls: ['./breadcrumbs-truncate-head-items-example.scss'],
    template: `
        <nav class="kbq-breadcrumbs_truncate-by-length" kbq-breadcrumbs>
            @for (link of data; track link) {
                <kbq-breadcrumb-item
                    [routerLink]="link"
                    [queryParams]="{ queryParams: link }"
                    [fragment]="link"
                    [text]="link"
                />
            }
        </nav>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbs,
        KbqBreadcrumbItem
    ]
})
export class BreadcrumbsTruncateHeadItemsExample {
    data = ['Main', 'Upper-level system', 'Users'];
}
