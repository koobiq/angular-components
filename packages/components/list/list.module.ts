import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { KbqActionContainer, KbqLine, KbqOptionModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListOption, KbqListOptionCaption, KbqListSelection } from './list-selection.component';
import { KbqList, KbqListItem } from './list.component';

@NgModule({
    imports: [
        A11yModule,
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
        KbqList,
        KbqListSelection,
        KbqListItem,
        KbqListOption,
        KbqListOptionCaption,
        KbqOptionModule
    ]
})
export class KbqListModule {}
