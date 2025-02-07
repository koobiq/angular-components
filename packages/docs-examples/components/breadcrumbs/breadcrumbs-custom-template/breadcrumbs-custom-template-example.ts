import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Breadcrumbs custom-template
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-custom-template-example',
    template: `
        <nav kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb; let last = $last) {
                <kbq-breadcrumb-item [routerLink]="breadcrumb.url" [text]="breadcrumb.label">
                    <a *kbqBreadcrumbView [routerLink]="breadcrumb.url" tabindex="-1">
                        <button [disabled]="last" [attr.aria-current]="last ? 'page' : null" kbq-button kbqBreadcrumb>
                            {{ breadcrumb.label }}
                            <i kbq-icon="kbq-file-code-o_16"></i>
                        </button>
                    </a>
                </kbq-breadcrumb-item>
            }
        </nav>
    `,
    imports: [
        RouterLink,
        KbqButtonModule,
        KbqIconModule,
        KbqBreadcrumbsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsCustomTemplateExample {
    breadcrumbs = [
        { label: 'Information Security', url: '/information-security' },
        { label: 'Access Control', url: '/information-security/access-control' },
        { label: 'Authorization', url: '/information-security/access-control/authorization' },
        { label: 'RBAC', url: '/information-security/access-control/authorization/rbac' },
        { label: 'Roles', url: '/information-security/access-control/authorization/rbac/roles' }
    ];
}
