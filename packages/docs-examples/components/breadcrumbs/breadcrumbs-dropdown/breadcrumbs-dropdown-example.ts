import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbItem, KbqBreadcrumbs, KbqDefaultBreadcrumbStyler } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

/**
 * @title Breadcrumbs sizes
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-dropdown-example',
    template: `
        <nav>
            <a
                *kbqBreadcrumbItem
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                kbq-button
                kbqBreadcrumb
                routerLink="Information Security"
            >
                Information Security
            </a>

            <a
                *kbqBreadcrumbItem
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                kbq-button
                kbqBreadcrumb
                routerLink="Access Control"
            >
                Access Control
            </a>
            <a
                *kbqBreadcrumbItem
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                kbq-button
                kbqBreadcrumb
                routerLink="Authorization"
            >
                Authorization
            </a>

            <ng-container *kbqBreadcrumbItem>
                <button kbq-button kbqBreadcrumb>
                    Access Control
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </ng-container>
        </nav>
    `,
    imports: [
        KbqBreadcrumbs,
        RouterLink,
        KbqButtonModule,
        KbqDefaultBreadcrumbStyler,
        KbqIconModule,
        KbqDropdownModule,
        KbqBreadcrumbItem,
        RdxRovingFocusItemDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsDropdownExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
