import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { AutocompleteOverviewExample } from './autocomplete-overview/autocomplete-overview-example';

export { AutocompleteOverviewExample };

const EXAMPLES = [
    AutocompleteOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqAutocompleteModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class AutocompleteExamplesModule {}
