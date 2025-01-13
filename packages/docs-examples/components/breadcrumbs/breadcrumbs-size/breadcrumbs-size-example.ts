import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbItem, KbqBreadcrumbs } from '@koobiq/components/breadcrumbs';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';

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
                            <kbq-breadcrumb-item
                                [routerLink]="section"
                                [queryParams]="{ queryParams: 'queryParams' }"
                                [fragment]="'fragment'"
                                [text]="section"
                            />
                        }
                    </nav>
                </kbq-dd>
            }
        </kbq-dl>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbItem,
        KbqBreadcrumbs,
        KbqDlModule
    ]
})
export class BreadcrumbsSizeExample {
    data = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
    sizes: KbqDefaultSizes[] = ['compact', 'normal', 'big'];
}
