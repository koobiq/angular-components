import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Breadcrumbs Truncate Tail Items
 */
@Component({
    selector: 'breadcrumbs-truncate-tail-items-example',
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    template: `
        <nav class="example-breadcrumbs_truncate-last-by-length-reverse" kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs(); track breadcrumb) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb.url"
                    [queryParams]="{ queryParams: 'queryParams' }"
                    [fragment]="'fragment'"
                    [text]="breadcrumb.label"
                />
            }
        </nav>
    `,
    styles: `
        .example-breadcrumbs_truncate-last-by-length-reverse {
            .kbq-breadcrumb-item:last-of-type {
                max-width: 96px;

                /* The button already truncates its label; this only moves the ellipsis to the front, so the
                   part that tells the reports apart stays readable. */
                .kbq-button-text {
                    direction: rtl;
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BreadcrumbsTruncateTailItemsExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly breadcrumbs = computed(() => [
        { label: this.t().main, url: '/main' },
        { label: this.t().users, url: '/main/users' },
        { label: this.t().reportNumber, url: '/main/users/report-123456789' }
    ]);

    constructor() {
        super(TRANSLATIONS);
    }
}
