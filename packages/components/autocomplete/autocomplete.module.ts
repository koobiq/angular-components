import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqAutocompleteOrigin } from './autocomplete-origin.directive';
import {
    KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqAutocompleteTrigger
} from './autocomplete-trigger.directive';
import { KbqAutocomplete, KbqAutocompleteFooter } from './autocomplete.component';

@NgModule({
    imports: [
        KbqOptionModule,
        OverlayModule,
        KbqAutocomplete,
        KbqAutocompleteTrigger,
        KbqAutocompleteOrigin,
        KbqAutocompleteFooter
    ],
    providers: [KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER],
    exports: [
        KbqAutocomplete,
        KbqOptionModule,
        KbqAutocompleteTrigger,
        KbqAutocompleteOrigin,
        KbqAutocompleteFooter
    ]
})
export class KbqAutocompleteModule {}
