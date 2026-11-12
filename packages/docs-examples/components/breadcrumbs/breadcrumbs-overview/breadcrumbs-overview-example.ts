import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
export class BreadcrumbsOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly breadcrumbs = computed(() => [
        { label: this.t().main, url: '/main' },
        { label: this.t().standards, url: '/main/standards' },
        { label: this.t().aes, url: '/main/standards/advanced-encryption-standard' },
        { label: this.t().edit, url: '/main/standards/advanced-encryption-standard/edit' }
    ]);

    constructor() {
        super(TRANSLATIONS);
    }
}
