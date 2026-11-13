import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Breadcrumbs overview
 */
@Component({
    selector: 'breadcrumbs-overview-example',
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    template: `
        <nav kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs(); track breadcrumb) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb.url"
                    [queryParams]="{ queryParams: 'queryParam' }"
                    [fragment]="'fragment'"
                    [text]="breadcrumb.label"
                />
            }
        </nav>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly breadcrumbs = computed(() => [
        { label: this.t().main, url: '/main' },
        { label: this.t().standards, url: '/main/standards' },
        { label: this.t().aes, url: '/main/standards/advanced-encryption-standard' },
        { label: this.t().edit, url: '/main/standards/advanced-encryption-standard/edit' }
    ]);
}
