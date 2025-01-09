import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumb, KbqBreadcrumbs } from '@koobiq/components/breadcrumbs';

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
        KbqBreadcrumb,
        KbqBreadcrumbs
    ]
})
export class BreadcrumbsOverviewExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
