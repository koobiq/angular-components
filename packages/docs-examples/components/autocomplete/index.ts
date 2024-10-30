import { NgModule } from '@angular/core';
import { AutocompleteOverviewExample } from './autocomplete-overview/autocomplete-overview-example';

export { AutocompleteOverviewExample };

const EXAMPLES = [
    AutocompleteOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AutocompleteExamplesModule {}
