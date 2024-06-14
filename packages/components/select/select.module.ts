import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KBQ_SELECT_SCROLL_STRATEGY_PROVIDER, KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagModule } from '@koobiq/components/tag';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

import { KbqOptionTooltip } from './select-option.directive';
import {
    KbqSelect,
    KbqSelectFooter,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectSearchEmptyResult,
    KbqSelectTrigger
} from './select.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        KbqOptionModule,
        KbqIconModule,
        KbqTagModule,
        KbqToolTipModule
    ],
    exports: [
        KbqFormFieldModule,
        KbqSelect,
        KbqSelectSearch,
        KbqSelectSearchEmptyResult,
        KbqSelectTrigger,
        KbqSelectMatcher,
        KbqSelectFooter,
        KbqOptionTooltip,
        KbqOptionModule,
        CommonModule
    ],
    declarations: [
        KbqSelect,
        KbqSelectSearch,
        KbqSelectSearchEmptyResult,
        KbqSelectTrigger,
        KbqSelectMatcher,
        KbqOptionTooltip,
        KbqSelectFooter
    ],
    providers: [KBQ_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class KbqSelectModule {}
