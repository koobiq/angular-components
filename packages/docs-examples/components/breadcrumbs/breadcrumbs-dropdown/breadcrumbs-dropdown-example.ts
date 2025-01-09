import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    KbqBreadcrumb,
    KbqBreadcrumbs,
    KbqBreadcrumbView,
    KbqDefaultBreadcrumbStyler
} from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Breadcrumbs sizes
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-dropdown-example',
    template: `
        <nav kbq-breadcrumbs>
            <kbq-breadcrumb-item
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                routerLink="Information Security"
                text="Information Security"
            />

            <kbq-breadcrumb-item
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                routerLink="Access Control"
                text="Access Control"
            />

            <kbq-breadcrumb-item
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                routerLink="Authorization"
                text="Authorization"
            />

            <kbq-breadcrumb-item>
                <div *kbqBreadcrumbView>
                    <button [kbqDropdownTriggerFor]="siblingsListDropdown" kbq-button kbqBreadcrumb>
                        Access Control
                        <i kbq-icon="kbq-chevron-down-s_16" color="contrast-fade"></i>
                    </button>
                </div>
            </kbq-breadcrumb-item>
        </nav>

        <kbq-dropdown #siblingsListDropdown="kbqDropdown">
            <button kbq-dropdown-item routerLink="./RBAC">RBAC</button>
            <button kbq-dropdown-item routerLink="./ABAC">ABAC</button>
        </kbq-dropdown>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumb,
        KbqBreadcrumbView,
        KbqDefaultBreadcrumbStyler,
        KbqBreadcrumbs,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsDropdownExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
