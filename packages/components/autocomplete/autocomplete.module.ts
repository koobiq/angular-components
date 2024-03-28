import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqOptionModule, KbqCommonModule } from '@koobiq/components/core';

import { KbqAutocompleteOrigin } from './autocomplete-origin.directive';
import {
    KbqAutocompleteTrigger,
    KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './autocomplete-trigger.directive';
import { KbqAutocomplete } from './autocomplete.component';


@NgModule({
    imports: [KbqOptionModule, OverlayModule, KbqCommonModule, CommonModule],
    exports: [
        KbqAutocomplete,
        KbqOptionModule,
        KbqAutocompleteTrigger,
        KbqAutocompleteOrigin,
        KbqCommonModule
    ],
    declarations: [KbqAutocomplete, KbqAutocompleteTrigger, KbqAutocompleteOrigin],
    providers: [KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class KbqAutocompleteModule {}
