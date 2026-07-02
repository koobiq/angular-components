import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ViewEncapsulation,
    booleanAttribute,
    contentChild,
    input
} from '@angular/core';
import { KbqButton } from '@koobiq/components/button';

@Component({
    selector: 'table[kbq-table]',
    template: '<ng-content />',
    styleUrls: ['table.scss', 'table-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-table',
        '[class.kbq-table_bordered]': 'border()',
        '[class.kbq-table_disable-hover]': 'disableHover()'
    },
    exportAs: 'kbqTable'
})
export class KbqTable {
    readonly border = input(false, { transform: booleanAttribute });
    readonly disableHover = input(false, { transform: booleanAttribute });
}

@Directive({
    selector: 'kbq-table td',
    host: {
        '[class.kbq-table-cell_has-button]': '!!button()'
    }
})
export class KbqTableCellContent {
    readonly button = contentChild(KbqButton);
}
