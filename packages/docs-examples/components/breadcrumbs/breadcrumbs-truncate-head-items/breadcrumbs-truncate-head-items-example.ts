import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs Truncate Head Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-head-items-example',
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
    template: `
        <nav class="kbq-breadcrumbs_truncate-by-length" kbq-breadcrumbs>
            @for (breadcrumbs of breadcrumbs; track breadcrumbs) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumbs"
                    [queryParams]="{ queryParams: breadcrumbs }"
                    [fragment]="breadcrumbs"
                    [text]="breadcrumbs"
                />
            }
        </nav>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateHeadItemsExample {
    breadcrumbs = ['Main', 'Upper-level system', 'Users'];
}
