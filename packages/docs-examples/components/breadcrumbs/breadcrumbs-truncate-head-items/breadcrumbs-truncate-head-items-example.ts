import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs Truncate Head Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-head-items-example',
    styleUrls: ['./breadcrumbs-truncate-head-items-example.scss'],
    template: `
        <nav class="kbq-breadcrumbs_truncate-by-length" kbq-breadcrumbs>
            @for (navLink of navLinks; track navLink) {
                <kbq-breadcrumb-item
                    [routerLink]="navLink"
                    [queryParams]="{ queryParams: navLink }"
                    [fragment]="navLink"
                    [text]="navLink"
                />
            }
        </nav>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ]
})
export class BreadcrumbsTruncateHeadItemsExample {
    navLinks = ['Main', 'Upper-level system', 'Users'];
}
