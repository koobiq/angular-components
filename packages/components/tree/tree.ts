import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqTreeNodeOutlet } from './outlet';
import { KbqTreeBase } from './tree-base';

@Component({
    selector: 'kbq-tree',
    imports: [
        KbqTreeNodeOutlet
    ],
    template: `
        <ng-container kbqTreeNodeOutlet />
    `,
    styleUrls: ['./tree.scss', 'tree-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTree',
    host: {
        class: 'kbq-tree'
    }
})
export class KbqTree extends KbqTreeBase<any> {}
