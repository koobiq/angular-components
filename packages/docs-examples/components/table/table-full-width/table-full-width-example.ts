import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

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
export class TableFullWidthExample {}
