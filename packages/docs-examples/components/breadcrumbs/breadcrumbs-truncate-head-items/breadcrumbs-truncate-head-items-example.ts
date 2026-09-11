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
        <nav class="example-breadcrumbs_truncate-by-length" kbq-breadcrumbs>
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
        /* A width is all a breadcrumb needs to truncate: the button already ships the contract
           (\`.kbq-button-wrapper\` is a flex box with \`min-width: 0\`, \`.kbq-button-text\` carries the
           ellipsis), and overriding the wrapper is what used to break it. */
        .example-breadcrumbs_truncate-by-length {
            .kbq-breadcrumb-item {
                max-width: 124px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
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
