import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqAutocomplete, KbqAutocompleteFooter } from './autocomplete.component';
import { KbqAutocompleteOrigin } from './autocomplete-origin.directive';
import { KbqAutocompleteTrigger } from './autocomplete-trigger.directive';

@NgModule({
    imports: [
        KbqOptionModule,
        OverlayModule,
        KbqAutocomplete,
        KbqAutocompleteTrigger,
        KbqAutocompleteOrigin,
        KbqAutocompleteFooter
    ],
    exports: [
        KbqAutocomplete,
        KbqOptionModule,
        KbqAutocompleteTrigger,
        KbqAutocompleteOrigin,
        KbqAutocompleteFooter
    ]
})
export class KbqAutocompleteModule {}
