import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';

/**
 * @title Breadcrumbs Wrap
 */
@Component({
    standalone: true,
    selector: 'breadcrumbs-with-wrap-example',
    template: `
        <div [style.max-width.px]="320">
            <nav wrapMode="wrap" kbq-breadcrumbs [firstItemNegativeMargin]="false">
                @for (breadcrumb of breadcrumbs; track breadcrumb) {
                    <kbq-breadcrumb-item [text]="breadcrumb.label" />
                }
            </nav>
        </div>
    `,
    imports: [KbqBreadcrumbsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsWithWrapExample {
    breadcrumbs = [
        { label: 'Main' },
        { label: 'Standards' },
        { label: 'Advanced Encryption Standard' },
        { label: 'Edit' },
        { label: 'Test' }];
}
