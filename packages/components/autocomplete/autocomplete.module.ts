import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqCommonModule, KbqOptionModule } from '@koobiq/components/core';
import { KbqAutocompleteOrigin } from './autocomplete-origin.directive';
import {
    KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqAutocompleteTrigger
} from './autocomplete-trigger.directive';
import { KbqAutocomplete } from './autocomplete.component';

@NgModule({
    imports: [
        KbqOptionModule,
        OverlayModule,
        KbqCommonModule,
        NgClass
    ],
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
