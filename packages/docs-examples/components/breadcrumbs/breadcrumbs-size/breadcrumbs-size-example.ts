import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
                        @for (breadcrumb of breadcrumbs; track breadcrumb; let last = $last) {
                            <kbq-breadcrumb-item
                                [routerLink]="breadcrumb"
                                [queryParams]="{ queryParams: 'queryParams' }"
                                [fragment]="'fragment'"
                                [text]="breadcrumb"
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
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsSizeExample {
    breadcrumbs = ['Information Security', 'Access Control', 'Authorization', 'RBAC', 'Roles'];
    sizes: KbqDefaultSizes[] = ['compact', 'normal', 'big'];
}
