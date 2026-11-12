import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
export class TableFullWidthExample extends BaseLocalizedExample<ExampleText> {
    protected readonly rows = computed(() => this.text().rows);

    constructor() {
        super(TEXT);
    }
}
