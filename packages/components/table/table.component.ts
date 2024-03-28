import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'table[kbq-table]',
    exportAs: 'kbqTable',
    styleUrls: ['table.scss'],
    template: '<ng-content></ng-content>',
    host: {
        class: 'kbq-table'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTable {}

