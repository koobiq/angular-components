import { NgModule } from '@angular/core';
import { AutocompleteOverviewExample } from './autocomplete-overview/autocomplete-overview-example';
import { AutocompleteWithFooterExample } from './autocomplete-with-footer/autocomplete-with-footer-example';

export { AutocompleteOverviewExample, AutocompleteWithFooterExample };

const EXAMPLES = [
    AutocompleteOverviewExample,
    AutocompleteWithFooterExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AutocompleteExamplesModule {}
