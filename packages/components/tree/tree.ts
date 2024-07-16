import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqTreeBase } from './tree-base';

@Component({
    selector: 'kbq-tree',
    exportAs: 'kbqTree',
    template: `<ng-container kbqTreeNodeOutlet></ng-container>`,
    styleUrls: ['./tree.scss'],
    host: {
        class: 'kbq-tree'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTree extends KbqTreeBase<any> {}
