import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbItem, KbqBreadcrumbs, KbqDefaultBreadcrumbStyler } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Breadcrumbs sizes
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-size-example',
    template: `
        <kbq-dl [vertical]="true">
            @for (size of sizes; track size) {
                <kbq-dt class="kbq-text-normal">{{ size }}</kbq-dt>
                <kbq-dd>
                    <nav [size]="size" kbq-breadcrumbs>
                        @for (section of data; track section; let last = $last) {
                            <a
                                *kbqBreadcrumbItem
                                [routerLink]="section"
                                [queryParams]="{ queryParams: 'queryParams' }"
                                [fragment]="'fragment'"
                            >
                                <button [disabled]="last" kbq-button kbqBreadcrumb>
                                    {{ section }}
                                </button>
                            </a>
                        }
                    </nav>
                </kbq-dd>
            }
        </kbq-dl>
    `,
    imports: [
        KbqBreadcrumbs,
        RouterLink,
        KbqButtonModule,
        KbqLinkModule,
        KbqDefaultBreadcrumbStyler,
        KbqDlModule,
        KbqBreadcrumbItem
    ]
})
export class BreadcrumbsSizeExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
    sizes: KbqDefaultSizes[] = ['compact', 'normal', 'big'];
}
