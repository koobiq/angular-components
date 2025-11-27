import { ChangeDetectionStrategy, Component, ContentChild, Directive, Input, ViewEncapsulation } from '@angular/core';
import { KbqButton } from '@koobiq/components/button';

@Component({
    selector: 'table[kbq-table]',
    template: '<ng-content />',
    styleUrls: ['table.scss', 'table-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTable',
    host: {
        class: 'kbq-table',
        '[class.kbq-table_bordered]': 'border'
    }
})
export class KbqTable {
    @Input() border: boolean = false;
}

@Directive({
    selector: 'kbq-table td',
    host: {
        '[class.kbq-table-cell_has-button]': '!!button'
    }
})
export class KbqTableCellContent {
    @ContentChild(KbqButton) button: KbqButton;
}
