import { A11yModule } from '@angular/cdk/a11y';
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
import { KbqFormFieldModule } from '@koobiq/components/form-field';
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
        NgTemplateOutlet,
        A11yModule,
        KbqSelect,
        KbqOptionTooltip
    ],
    exports: [
        KbqSelect,
        KbqOptionTooltip,
        KbqOptionModule,
        KbqSelectSearch,
        KbqSelectFooter,
        KbqSelectMatcher,
        KbqSelectTrigger,
        KbqSelectSearchEmptyResult,
        KbqFormFieldModule
    ],
    providers: [KBQ_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class KbqSelectModule {}
