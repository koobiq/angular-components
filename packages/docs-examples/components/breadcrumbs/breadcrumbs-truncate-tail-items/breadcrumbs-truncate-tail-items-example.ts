import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Breadcrumbs Truncate Tail Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-tail-items-example',
    template: `
        <nav class="kbq-breadcrumbs_truncate-last-by-length-reverse" kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb) {
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
        .kbq-breadcrumbs_truncate-last-by-length-reverse {
            .kbq-breadcrumb-item:last-of-type {
                max-width: 96px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;

                .kbq-button-wrapper {
                    display: inline-block;
                    flex-grow: 1;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    direction: rtl;
                }
            }
        }
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateTailItemsExample {
    breadcrumbs = [
        { label: 'Main', url: '/main' },
        { label: 'Users', url: '/main/users' },
        { label: 'Report №123456789', url: '/main/users/report-123456789' }
    ];
    protected readonly PopUpPlacements = PopUpPlacements;
}
