import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import {
    KbqActionContainerComponent,
    KbqLineModule,
    KbqOptionModule,
    KbqPseudoCheckboxModule
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListOption, KbqListOptionCaption, KbqListSelection } from './list-selection.component';
import { KbqList, KbqListItem } from './list.component';

@NgModule({
    imports: [
        A11yModule,
        KbqPseudoCheckboxModule,
        KbqLineModule,
        KbqOptionModule,
        KbqActionContainerComponent,
        KbqIconModule
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
