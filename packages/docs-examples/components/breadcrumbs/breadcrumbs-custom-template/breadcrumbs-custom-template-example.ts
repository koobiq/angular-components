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
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb"
                    [queryParams]="{ queryParams: breadcrumb }"
                    [fragment]="breadcrumb"
                    [text]="breadcrumb"
                >
                    <a *kbqBreadcrumbView>
                        <button [disabled]="last" [attr.aria-current]="last ? 'page' : null" kbq-button kbqBreadcrumb>
                            {{ breadcrumb }}
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
    breadcrumbs = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
