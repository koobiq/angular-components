import { NgModule } from '@angular/core';
import { AutocompleteOverviewExample } from './autocomplete-overview/autocomplete-overview-example';
import { AutocompleteSearchSmartExample } from './autocomplete-search-smart/autocomplete-search-smart-example';
import { AutocompleteTextareaExample } from './autocomplete-textarea/autocomplete-textarea-example';
import { AutocompleteTriggersExample } from './autocomplete-triggers/autocomplete-triggers-example';
import { AutocompleteWithFooterExample } from './autocomplete-with-footer/autocomplete-with-footer-example';

export {
    AutocompleteOverviewExample,
    AutocompleteSearchSmartExample,
    AutocompleteTextareaExample,
    AutocompleteTriggersExample,
    AutocompleteWithFooterExample
};

const EXAMPLES = [
    AutocompleteOverviewExample,
    AutocompleteSearchSmartExample,
    AutocompleteTextareaExample,
    AutocompleteTriggersExample,
    AutocompleteWithFooterExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AutocompleteExamplesModule {}
