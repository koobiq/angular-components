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
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                routerLink="./info-sec"
                text="Information Security"
            />

            <kbq-breadcrumb-item
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                routerLink="./access-control"
                text="Access Control"
            />

            <kbq-breadcrumb-item
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
                routerLink="./authorization"
                text="Authorization"
            />

            <kbq-breadcrumb-item>
                <div *kbqBreadcrumbView>
                    <button
                        [kbqDropdownTriggerFor]="siblingsListDropdown"
                        [openByArrowDown]="false"
                        kbq-button
                        kbqBreadcrumb
                    >
                        Access Control
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
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
        KbqBreadcrumbsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsDropdownExample {}
