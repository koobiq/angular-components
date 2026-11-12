import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
export class BreadcrumbsWithWrapExample extends BaseLocalizedExample<ExampleText> {
    readonly breadcrumbs = computed(() => [
        { label: this.text().main },
        { label: this.text().standards },
        { label: this.text().aes },
        { label: this.text().edit },
        { label: this.text().test }
    ]);

    constructor() {
        super(TEXT);
    }
}
