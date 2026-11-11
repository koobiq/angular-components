import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';
import { injectExampleText } from './l10n';

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
    protected readonly text = injectExampleText();

    protected readonly rows = computed(() => this.text().rows);
}
