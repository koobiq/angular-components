import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    KBQ_SELECT_SCROLL_STRATEGY_PROVIDER,
    KbqPseudoCheckboxModule,
    KbqSelectFooter,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectSearchEmptyResult,
    KbqSelectTrigger
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelect } from './tree-select.component';

@NgModule({
    imports: [
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
        NgClass,
        NgTemplateOutlet,
        A11yModule
    ],
    exports: [
        KbqTreeSelect,
        KbqSelectSearch,
        KbqSelectFooter,
        KbqSelectMatcher,
        KbqSelectTrigger,
        KbqSelectSearchEmptyResult
    ],
    declarations: [KbqTreeSelect],
    providers: [KBQ_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class KbqTreeSelectModule {}
