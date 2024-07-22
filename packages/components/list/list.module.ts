import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqLineModule, KbqOptionModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqListOption, KbqListOptionCaption, KbqListSelection } from './list-selection.component';
import { KbqList, KbqListItem } from './list.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        KbqPseudoCheckboxModule,
        KbqLineModule,
        KbqOptionModule
    ],
    exports: [
        KbqList,
        KbqListSelection,
        KbqListItem,
        KbqListOption,
        KbqListOptionCaption,
        KbqOptionModule
    ],
    declarations: [
        KbqList,
        KbqListSelection,
        KbqListItem,
        KbqListOption,
        KbqListOptionCaption
    ]
})
export class KbqListModule {}
