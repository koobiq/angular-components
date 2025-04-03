import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs Wrap
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-with-wrap-example',
    template: `
        <div [style.max-width.px]="320">
            <nav [firstItemNegativeMargin]="false" wrapMode="wrap" kbq-breadcrumbs>
                @for (breadcrumb of breadcrumbs; track breadcrumb) {
                    <kbq-breadcrumb-item
                        [routerLink]="breadcrumb.url"
                        [queryParams]="{ queryParams: 'queryParam' }"
                        [fragment]="'fragment'"
                        [text]="breadcrumb.label"
                    />
                }
            </nav>
        </div>
    `,
    imports: [
        RouterLink,
        KbqBreadcrumbsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsWithWrapExample {
    breadcrumbs = [
        { label: 'Main', url: '/main' },
        { label: 'Standards', url: '/main/standards' },
        { label: 'Advanced Encryption Standard', url: '/main/standards/advanced-encryption-standard' },
        { label: 'Edit', url: '/main/standards/advanced-encryption-standard/edit' },
        { label: 'Test', url: '/main/standards/advanced-encryption-standard/edit/test' }
    ];
}
