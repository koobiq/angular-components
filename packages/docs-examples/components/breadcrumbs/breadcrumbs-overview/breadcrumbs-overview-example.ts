import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsOverviewExample {
    breadcrumbs = [
        { label: 'Main', url: '/main' },
        { label: 'Standards', url: '/main/standards' },
        { label: 'Advanced Encryption Standard', url: '/main/standards/advanced-encryption-standard' },
        { label: 'Edit', url: '/main/standards/advanced-encryption-standard/edit' }
    ];
}
