import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbItem, KbqBreadcrumbs } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs overview
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-overview-example',
    template: `
        <nav kbq-breadcrumbs>
            @for (section of data; track section; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="section"
                    [queryParams]="{ queryParams: section }"
                    [fragment]="section"
                    [text]="section"
                />
            }
        </nav>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbItem,
        KbqBreadcrumbs
    ]
})
export class BreadcrumbsOverviewExample {
    data = ['Main', 'Standards', 'Advanced Encryption Standard', 'Edit'];
}
