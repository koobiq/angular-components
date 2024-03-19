import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { asyncScheduler } from 'rxjs';
// tslint:disable-next-line:rxjs-no-internal
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';

import { KbqTreeNodeDef } from './node';
import { KbqTreeNodeOutlet } from './outlet';
import { KbqTreeNodePadding } from './padding.directive';
import { KbqTreeNodeToggleDirective, KbqTreeNodeToggleComponent } from './toggle';
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
        CommonModule,
        KbqPseudoCheckboxModule,
        KbqIconModule
    ],
    exports: KBQ_TREE_DIRECTIVES,
    declarations: KBQ_TREE_DIRECTIVES,
    providers: [{ provide: AsyncScheduler, useValue: asyncScheduler }]
})
export class KbqTreeModule {}
