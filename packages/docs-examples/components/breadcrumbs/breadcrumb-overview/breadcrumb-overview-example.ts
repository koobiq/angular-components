import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbs, KbqDefaultBreadcrumb } from '@koobiq/components/breadcrumbs';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Breadcrumbs overview
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-overview-example',
    template: `
        <kbq-breadcrumbs>
            @for (section of data; track section; let last = $last) {
                <a
                    *kbqBreadcrumbItem
                    [class]="last ? 'kbq-breadcrumb_current' : null"
                    [routerLink]="section"
                    kbq-breadcrumb
                >
                    {{ section }}
                </a>
            }
        </kbq-breadcrumbs>
    `,
    imports: [
        KbqIconModule,
        KbqBreadcrumbs,
        KbqDefaultBreadcrumb,
        RouterLink
    ]
})
export class BreadcrumbOverviewExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
