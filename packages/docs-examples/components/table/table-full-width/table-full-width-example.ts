import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Table full width
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'table-full-width-example',
    imports: [
        KbqTableModule
    ],
    templateUrl: 'table-full-width-example.html'
})
export class TableFullWidthExample {}
