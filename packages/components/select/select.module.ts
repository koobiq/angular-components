import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    KBQ_SELECT_SCROLL_STRATEGY_PROVIDER,
    KbqOptionModule,
    KbqSelectFooter,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectSearchEmptyResult,
    KbqSelectTrigger
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqOptionTooltip } from './select-option.directive';
import { KbqSelect } from './select.component';

@NgModule({
    imports: [
        OverlayModule,
        KbqOptionModule,
        KbqIconModule,
        KbqTagsModule,
        KbqToolTipModule,
        KbqSelectSearch,
        KbqSelectFooter,
        KbqSelectMatcher,
        KbqSelectTrigger,
        KbqSelectSearchEmptyResult,
        NgClass,
        NgTemplateOutlet
    ],
    exports: [
        KbqSelect,
        KbqOptionTooltip,
        KbqOptionModule,
        KbqSelectSearch,
        KbqSelectFooter,
        KbqSelectMatcher,
        KbqSelectTrigger,
        KbqSelectSearchEmptyResult
    ],
    declarations: [
        KbqSelect,
        KbqOptionTooltip
    ],
    providers: [KBQ_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class KbqSelectModule {}
