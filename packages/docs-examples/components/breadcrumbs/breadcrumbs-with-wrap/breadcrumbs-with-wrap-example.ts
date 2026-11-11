import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { injectExampleText } from '../l10n';

/**
 * @title Breadcrumbs Wrap
 */
@Component({
    selector: 'breadcrumbs-with-wrap-example',
    imports: [KbqBreadcrumbsModule],
    template: `
        <div [style.max-width.px]="320">
            <nav wrapMode="wrap" kbq-breadcrumbs [firstItemNegativeMargin]="false">
                @for (breadcrumb of breadcrumbs(); track breadcrumb) {
                    <kbq-breadcrumb-item [text]="breadcrumb.label" />
                }
            </nav>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsWithWrapExample {
    protected readonly text = injectExampleText();

    readonly breadcrumbs = computed(() => [
        { label: this.text().main },
        { label: this.text().standards },
        { label: this.text().aes },
        { label: this.text().edit },
        { label: this.text().test }
    ]);
}
