import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Breadcrumbs Truncate Tail Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-tail-items-example',
    template: `
        <nav class="kbq-breadcrumbs_truncate-last-by-length-reverse" kbq-breadcrumbs>
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
    styleUrls: ['breadcrumbs-truncate-tail-items-example.scss'],
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ]
})
export class BreadcrumbsTruncateTailItemsExample {
    navLinks = ['Main', 'Users', 'Report №123456789'];
    protected readonly PopUpPlacements = PopUpPlacements;
}
