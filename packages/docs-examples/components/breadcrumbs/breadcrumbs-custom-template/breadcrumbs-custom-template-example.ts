import { Component } from '@angular/core';
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
            @for (navLink of navLinks; track navLink; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="navLink"
                    [queryParams]="{ queryParams: navLink }"
                    [fragment]="navLink"
                    [text]="navLink"
                >
                    <a *kbqBreadcrumbView>
                        <button [disabled]="last" [attr.aria-current]="last ? 'page' : null" kbq-button kbqBreadcrumb>
                            {{ navLink }}
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
    ]
})
export class BreadcrumbsCustomTemplateExample {
    navLinks = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
