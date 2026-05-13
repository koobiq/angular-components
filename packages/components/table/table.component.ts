import { ChangeDetectionStrategy, Component, ContentChild, Directive, Input, ViewEncapsulation } from '@angular/core';
import { KbqButton } from '@koobiq/components/button';

@Component({
    selector: 'table[kbq-table]',
    template: '<ng-content />',
    styleUrls: ['table.scss', 'table-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-table',
        '[class.kbq-table_bordered]': 'border'
    },
    exportAs: 'kbqTable'
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
