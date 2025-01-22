import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
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
                <kbq-dt class="kbq-text-normal">{{ size | titlecase }}</kbq-dt>
                <kbq-dd>
                    <nav [size]="size" kbq-breadcrumbs>
                        @for (navLink of navLinks; track navLink; let last = $last) {
                            <kbq-breadcrumb-item
                                [routerLink]="navLink"
                                [queryParams]="{ queryParams: 'queryParams' }"
                                [fragment]="'fragment'"
                                [text]="navLink"
                            />
                        }
                    </nav>
                </kbq-dd>
            }
        </kbq-dl>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqDlModule,
        TitleCasePipe
    ]
})
export class BreadcrumbsSizeExample {
    navLinks = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
    sizes: KbqDefaultSizes[] = ['compact', 'normal', 'big'];
}
