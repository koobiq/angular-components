import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Table full width
 */
@Component({
    selector: 'table-full-width-example',
    imports: [
        KbqTableModule
    ],
    templateUrl: 'table-full-width-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFullWidthExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly rows = computed(() => this.t().rows);
}
