import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs overview
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-overview-example',
    template: `
        <nav kbq-breadcrumbs>
            @for (navLink of navLinks; track navLink; let last = $last) {
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
export class BreadcrumbsOverviewExample {
    navLinks = ['Main', 'Standards', 'Advanced Encryption Standard', 'Edit'];
}
