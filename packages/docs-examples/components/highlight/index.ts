import { NgModule } from '@angular/core';
import { HighlightBackgroundComplexExample } from './highlight-background-complex/highlight-background-complex-example';
import { HighlightBackgroundTableExample } from './highlight-background-table/highlight-background-table-example';
import { HighlightBackgroundExample } from './highlight-background/highlight-background-example';
import { HighlightSelectExample } from './highlight-select/highlight-select-example';

export {
    HighlightBackgroundComplexExample,
    HighlightBackgroundExample,
    HighlightBackgroundTableExample,
    HighlightSelectExample
};

const EXAMPLES = [
    HighlightSelectExample,
    HighlightBackgroundExample,
    HighlightBackgroundComplexExample,
    HighlightBackgroundTableExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class HighlightExamplesModule {}
