import { ChangeDetectionStrategy, Component } from '@angular/core';
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
                    [routerLink]="breadcrumb"
                    [queryParams]="{ queryParams: breadcrumb }"
                    [fragment]="breadcrumb"
                    [text]="breadcrumb"
                />
            }
        </nav>
    `,
    styleUrls: ['breadcrumbs-truncate-tail-items-example.scss'],
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateTailItemsExample {
    breadcrumbs = ['Main', 'Users', 'Report №123456789'];
    protected readonly PopUpPlacements = PopUpPlacements;
}
