import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    KbqBreadcrumb,
    KbqBreadcrumbs,
    KbqBreadcrumbView,
    KbqDefaultBreadcrumbStyler
} from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Breadcrumbs custom-template
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-custom-template-example',
    template: `
        <nav [max]="4" kbq-breadcrumbs>
            @for (section of data; track section; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="section"
                    [queryParams]="{ queryParams: section }"
                    [fragment]="section"
                    [text]="section"
                >
                    <a *kbqBreadcrumbView>
                        <button [disabled]="last" [attr.aria-current]="last ? 'page' : null" kbq-button kbqBreadcrumb>
                            {{ section }}
                            <i kbq-icon="kbq-file-code-o_16"></i>
                        </button>
                    </a>
                </kbq-breadcrumb-item>
            }
        </nav>
    `,
    imports: [
        KbqBreadcrumbs,
        RouterLink,
        KbqButtonModule,
        KbqLinkModule,
        KbqDefaultBreadcrumbStyler,
        KbqDlModule,
        KbqBreadcrumbView,
        KbqBreadcrumb,
        KbqIcon
    ]
})
export class BreadcrumbsCustomTemplateExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
}
