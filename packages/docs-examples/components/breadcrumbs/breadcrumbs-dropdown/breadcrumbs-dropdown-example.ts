import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
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
                routerLink="./info-sec"
                text="Information Security"
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
            />

            <kbq-breadcrumb-item
                routerLink="./access-control"
                text="Access Control"
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
            />

            <kbq-breadcrumb-item
                routerLink="./authorization"
                text="Authorization"
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
            />

            <kbq-breadcrumb-item>
                <div *kbqBreadcrumbView>
                    <button kbq-button kbqBreadcrumb [kbqDropdownTriggerFor]="siblingsListDropdown">
                        Access Control
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                    </button>
                </div>
            </kbq-breadcrumb-item>
        </nav>

        <kbq-dropdown #siblingsListDropdown="kbqDropdown">
            <a kbq-dropdown-item routerLink="./RBAC">RBAC</a>
            <a kbq-dropdown-item routerLink="./ABAC">ABAC</a>
        </kbq-dropdown>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsDropdownExample {}
