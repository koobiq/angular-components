import { NgModule } from '@angular/core';
import { AutocompleteOverviewExample } from './autocomplete-overview/autocomplete-overview-example';
import { AutocompleteSearchSmartExample } from './autocomplete-search-smart/autocomplete-search-smart-example';
import { AutocompleteWithFooterExample } from './autocomplete-with-footer/autocomplete-with-footer-example';

export { AutocompleteOverviewExample, AutocompleteSearchSmartExample, AutocompleteWithFooterExample };

const EXAMPLES = [
    AutocompleteOverviewExample,
    AutocompleteSearchSmartExample,
    AutocompleteWithFooterExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AutocompleteExamplesModule {}
