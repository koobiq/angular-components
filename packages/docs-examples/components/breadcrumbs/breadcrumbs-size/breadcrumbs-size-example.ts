import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Breadcrumbs sizes
 */
@Component({
    selector: 'breadcrumbs-size-example',
    imports: [
        RouterLink,
        KbqBreadcrumbsModule,
        KbqDl,
        KbqDt,
        KbqDd,
        TitleCasePipe
    ],
    template: `
        <kbq-dl [vertical]="true">
            @for (size of sizes; track size) {
                <kbq-dt class="kbq-text-normal">{{ size | titlecase }}</kbq-dt>
                <kbq-dd>
                    <nav kbq-breadcrumbs [size]="size">
                        @for (breadcrumb of breadcrumbs(); track breadcrumb; let last = $last) {
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsSizeExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly breadcrumbs = computed(() => [
        { label: this.t().informationSecurity, url: '/information-security' },
        { label: this.t().accessControl, url: '/information-security/access-control' },
        { label: this.t().authorization, url: '/information-security/access-control/authorization' },
        { label: 'RBAC', url: '/information-security/access-control/authorization/rbac' },
        { label: this.t().roles, url: '/information-security/access-control/authorization/rbac/roles' }
    ]);
    sizes: KbqDefaultSizes[] = ['compact', 'normal', 'big'];

    constructor() {
        super(TRANSLATIONS);
    }
}
