import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqStateSaving } from '@koobiq/components/core';
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
    // `KbqTreeNode` reaches its tree through `KbqTreeBase`, as it does in `KbqTreeSelection`.
    providers: [{ provide: KbqTreeBase, useExisting: KbqTree }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tree',
        role: 'tree'
    },
    // `useStateSaving` and `stateSavingKey` are the directive's inputs, surfaced on the tree.
    hostDirectives: [
        { directive: KbqStateSaving, inputs: ['useStateSaving', 'stateSavingKey'] }
    ],
    exportAs: 'kbqTree'
})
export class KbqTree extends KbqTreeBase<any> {}
