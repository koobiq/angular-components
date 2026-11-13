import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly breadcrumbs = computed(() => [
        { label: this.t().main },
        { label: this.t().standards },
        { label: this.t().aes },
        { label: this.t().edit },
        { label: this.t().test }
    ]);
}
