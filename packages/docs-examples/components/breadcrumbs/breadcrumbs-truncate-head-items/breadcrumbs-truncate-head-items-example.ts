import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs Truncate Head Items
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-truncate-head-items-example',
    styleUrls: ['./breadcrumbs-truncate-head-items-example.scss'],
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsTruncateHeadItemsExample {
    breadcrumbs = ['Main', 'Upper-level system', 'Users'];
}
