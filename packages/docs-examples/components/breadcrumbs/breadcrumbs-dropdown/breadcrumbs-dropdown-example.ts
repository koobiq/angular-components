import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Breadcrumbs sizes
 */
@Component({
    selector: 'breadcrumbs-dropdown-example',
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule
    ],
    template: `
        <nav kbq-breadcrumbs>
            <kbq-breadcrumb-item
                routerLink="./info-sec"
                [text]="t().informationSecurity"
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
            />

            <kbq-breadcrumb-item
                routerLink="./access-control"
                [text]="t().accessControl"
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
            />

            <kbq-breadcrumb-item
                routerLink="./authorization"
                [text]="t().authorization"
                [queryParams]="{ queryParams: 'queryParams' }"
                [fragment]="'fragment'"
            />

            <kbq-breadcrumb-item>
                <div *kbqBreadcrumbView>
                    <button kbq-button kbqBreadcrumb [kbqDropdownTriggerFor]="siblingsListDropdown">
                        {{ t().accessControl }}
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsDropdownExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
