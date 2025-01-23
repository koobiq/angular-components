import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs overview
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-overview-example',
    template: `
        <nav kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs; track breadcrumb; let last = $last) {
                <kbq-breadcrumb-item
                    [routerLink]="breadcrumb"
                    [queryParams]="{ queryParams: breadcrumb }"
                    [fragment]="breadcrumb"
                    [text]="breadcrumb"
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
export class BreadcrumbsOverviewExample {
    breadcrumbs = ['Main', 'Standards', 'Advanced Encryption Standard', 'Edit'];
}
