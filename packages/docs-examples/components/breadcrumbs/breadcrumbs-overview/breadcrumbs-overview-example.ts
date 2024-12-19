import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    BreadcrumbItem,
    KbqBreadcrumbBehavior,
    KbqBreadcrumbs,
    KbqBreadcrumbsSeparator
} from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Breadcrumbs overview
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-overview-example',
    template: `
        <nav kbq-breadcrumbs size="compact">
            @for (section of data; track section; let last = $last) {
                <breadcrumb-item>
                    <a [routerLink]="section" [queryParams]="{ name: 'ferret' }">
                        <button [last]="last" [disabled]="last" kbq-button kbqBreadcrumb>
                            {{ section }}
                        </button>
                    </a>
                </breadcrumb-item>
            }
        </nav>

        <h3>Test</h3>
        <nav kbq-breadcrumbs size="compact">
            <breadcrumb-item>
                <a [queryParams]="{ name: 'ferret' }" routerLink="'test'">
                    <button kbq-button kbqBreadcrumb>test</button>
                </a>
            </breadcrumb-item>
            <breadcrumb-item>
                <a [queryParams]="{ name: 'ferret' }" routerLink="'test'">
                    <button kbq-button kbqBreadcrumb>test</button>
                </a>
            </breadcrumb-item>
        </nav>

        <nav kbq-breadcrumbs>
            @for (section of data; track section; let last = $last) {
                <breadcrumb-item>
                    <a
                        [routerLink]="section"
                        [queryParams]="{ name: 'ferret' }"
                        [disabled]="last"
                        noUnderline
                        kbq-link
                        kbqBreadcrumb
                    >
                        {{ section }}
                    </a>
                </breadcrumb-item>
            }
        </nav>
    `,
    imports: [
        KbqIconModule,
        KbqBreadcrumbs,
        RouterLink,
        BreadcrumbItem,
        KbqBreadcrumbsSeparator,
        KbqButtonModule,
        KbqLinkModule,
        KbqBreadcrumbBehavior
    ]
})
export class BreadcrumbsOverviewExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
