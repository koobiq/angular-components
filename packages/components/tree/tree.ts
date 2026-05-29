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
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tree'
    },
    exportAs: 'kbqTree'
})
export class KbqTree extends KbqTreeBase<any> {}
