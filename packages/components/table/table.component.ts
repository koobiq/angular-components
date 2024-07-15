import { ChangeDetectionStrategy, Component, ContentChild, Directive, Input, ViewEncapsulation } from '@angular/core';
import { KbqButton } from '@koobiq/components/button';

@Component({
    selector: 'table[kbq-table]',
    exportAs: 'kbqTable',
    styleUrls: ['table.scss'],
    template: '<ng-content></ng-content>',
    host: {
        class: 'kbq-table',
        '[class.kbq-table_bordered]': 'border',
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbqTable {
    @Input() border: boolean = false;
}

@Directive({
    selector: 'kbq-table td',
    host: {
        '[class.kbq-table-cell_has-button]': '!!button',
    },
})
export class KbqTableCellContent {
    @ContentChild(KbqButton) button: KbqButton;
}
