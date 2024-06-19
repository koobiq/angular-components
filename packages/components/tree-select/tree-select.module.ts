import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KBQ_SELECT_SCROLL_STRATEGY_PROVIDER, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTreeModule } from '@koobiq/components/tree';

import {
    KbqTreeSelect,
    KbqTreeSelectFooter,
    KbqTreeSelectMatcher,
    KbqTreeSelectTrigger
} from './tree-select.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        KbqTreeModule,
        KbqIconModule,
        KbqTagsModule,
        KbqPseudoCheckboxModule,
        KbqSelectModule
    ],
    exports: [KbqTreeSelect, KbqTreeSelectTrigger, KbqTreeSelectMatcher, KbqTreeSelectFooter, CommonModule],
    declarations: [KbqTreeSelect, KbqTreeSelectTrigger, KbqTreeSelectMatcher, KbqTreeSelectFooter],
    providers: [KBQ_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class KbqTreeSelectModule {}
