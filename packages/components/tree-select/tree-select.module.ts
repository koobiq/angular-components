import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    KBQ_SELECT_SCROLL_STRATEGY_PROVIDER,
    KbqPseudoCheckboxModule,
    KbqSelectFooter,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectSearchEmptyResult,
    KbqSelectTrigger,
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelect } from './tree-select.component';

@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        KbqTreeModule,
        KbqIconModule,
        KbqTagsModule,
        KbqPseudoCheckboxModule,
        KbqSelectSearch,
        KbqSelectFooter,
        KbqSelectMatcher,
        KbqSelectTrigger,
        KbqSelectSearchEmptyResult,
    ],
    exports: [
        KbqTreeSelect,
        CommonModule,
        KbqSelectSearch,
        KbqSelectFooter,
        KbqSelectMatcher,
        KbqSelectTrigger,
        KbqSelectSearchEmptyResult,
    ],
    declarations: [KbqTreeSelect],
    providers: [KBQ_SELECT_SCROLL_STRATEGY_PROVIDER],
})
export class KbqTreeSelectModule {}
