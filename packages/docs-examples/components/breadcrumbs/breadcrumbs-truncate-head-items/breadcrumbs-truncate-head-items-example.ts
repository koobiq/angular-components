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
        .example-breadcrumbs_truncate-by-length {
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

                /* The wrapper above clips, but the node that actually holds the text is this one, and as an
                   inline-block it shrink-to-fits to the full text width regardless. What overflows is then an
                   atomic inline box rather than text, which text-overflow cannot put an ellipsis on. */
                .kbq-button-text {
                    max-width: 100%;
                }
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
