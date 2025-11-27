import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqOptionModule } from '@koobiq/components/core';
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
        NgClass,
        KbqAutocomplete,
        KbqAutocompleteTrigger,
        KbqAutocompleteOrigin
    ],
    exports: [
        KbqAutocomplete,
        KbqOptionModule,
        KbqAutocompleteTrigger,
        KbqAutocompleteOrigin
    ],
    providers: [KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class KbqAutocompleteModule {}
