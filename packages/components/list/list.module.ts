import { A11yModule } from '@angular/cdk/a11y';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { KbqActionContainer, KbqLine, KbqOptionModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListOption, KbqListOptionCaption, KbqListSelection } from './list-selection.component';
import { KbqList, KbqListItem } from './list.component';

@NgModule({
    imports: [
        A11yModule,
        // Re-exported so that a drag handle can be projected into an option without the consumer
        // reaching into `@angular/cdk/drag-drop` — the list hides CDK everywhere else.
        CdkDragHandle,
        KbqPseudoCheckboxModule,
        KbqLine,
        KbqOptionModule,
        KbqActionContainer,
        KbqIconModule,
        KbqList,
        KbqListSelection,
        KbqListItem,
        KbqListOption,
        KbqListOptionCaption
    ],
    exports: [
        CdkDragHandle,
        KbqList,
        KbqListSelection,
        KbqListItem,
        KbqListOption,
        KbqListOptionCaption,
        KbqOptionModule
    ]
})
export class KbqListModule {}
