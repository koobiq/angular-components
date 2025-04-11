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
                                [routerLink]="breadcrumb.url"
                                [queryParams]="{ queryParams: 'queryParams' }"
                                [fragment]="'fragment'"
                                [text]="breadcrumb.label"
                            />
                        }
                    </nav>
                </kbq-dd>
            }
        </kbq-dl>
    `,
    styles: `
        :host .kbq-dl.kbq-dl_vertical .kbq-dd {
            max-width: 100%;
            container-type: inline-size;
            box-sizing: border-box;
        }
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
    breadcrumbs = [
        { label: 'Information Security', url: '/information-security' },
        { label: 'Access Control', url: '/information-security/access-control' },
        { label: 'Authorization', url: '/information-security/access-control/authorization' },
        { label: 'RBAC', url: '/information-security/access-control/authorization/rbac' },
        { label: 'Roles', url: '/information-security/access-control/authorization/rbac/roles' }
    ];
    sizes: KbqDefaultSizes[] = ['compact', 'normal', 'big'];
}
