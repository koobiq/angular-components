import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs Truncate Head Items
 */
@Component({
    selector: 'breadcrumbs-truncate-head-items-example',
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    template: `
        <nav class="kbq-breadcrumbs_truncate-by-length" kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb.url"
                    [queryParams]="{ queryParams: 'queryParam' }"
                    [fragment]="'fragment'"
                    [text]="breadcrumb.label"
                />
            }
        </nav>
    `,
    styles: `
        .kbq-breadcrumbs_truncate-by-length {
            .kbq-breadcrumb-item {
                max-width: 124px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;

                .kbq-button-wrapper {
                    display: inline-block;
                    flex-grow: 1;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
        }
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateHeadItemsExample {
    breadcrumbs = [
        { label: 'Components', url: '/components' },
        { label: 'Commit', url: '/components/commit' },
        {
            label: 'cacb86c728451b57740706d19429e6629140b7c5',
            url: '/components/commit/cacb86c728451b57740706d19429e6629140b7c5'
        }
    ];
}
