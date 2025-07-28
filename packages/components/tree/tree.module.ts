import { NgModule } from '@angular/core';
import { KbqActionContainer, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { asyncScheduler } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { KbqTreeNodeDef } from './node';
import { KbqTreeNodeOutlet } from './outlet';
import { KbqTreeNodePadding } from './padding.directive';
import { KbqTreeNodeToggleComponent, KbqTreeNodeToggleDirective } from './toggle';
import { KbqTree } from './tree';
import { KbqTreeNode } from './tree-base';
import { KbqTreeOption } from './tree-option.component';
import { KbqTreeSelection } from './tree-selection.component';

const KBQ_TREE_DIRECTIVES = [
    KbqTreeNodeOutlet,
    KbqTreeNodeDef,
    KbqTreeNode,
    KbqTreeNodePadding,
    KbqTree,
    KbqTreeSelection,
    KbqTreeOption,
    KbqTreeNodeToggleComponent,
    KbqTreeNodeToggleDirective
];

@NgModule({
    imports: [
        KbqPseudoCheckboxModule,
        KbqIconModule,
        KbqActionContainer
    ],
    exports: KBQ_TREE_DIRECTIVES,
    declarations: KBQ_TREE_DIRECTIVES,
    providers: [{ provide: AsyncScheduler, useValue: asyncScheduler }]
})
export class KbqTreeModule {}
