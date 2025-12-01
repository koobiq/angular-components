import { NgModule } from '@angular/core';
import { TextareaCanGrowExample } from './textarea-can-grow/textarea-can-grow-example';
import { TextareaDisabledExample } from './textarea-disabled/textarea-disabled-example';
import { TextareaErrorStateExample } from './textarea-error-state/textarea-error-state-example';
import { TextareaMaxRowsExample } from './textarea-max-rows/textarea-max-rows-example';
import { TextareaOverviewExample } from './textarea-overview/textarea-overview-example';

export {
    TextareaCanGrowExample,
    TextareaDisabledExample,
    TextareaErrorStateExample,
    TextareaMaxRowsExample,
    TextareaOverviewExample
};

const EXAMPLES = [
    TextareaOverviewExample,
    TextareaDisabledExample,
    TextareaErrorStateExample,
    TextareaCanGrowExample,
    TextareaMaxRowsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TextareaExamplesModule {}
