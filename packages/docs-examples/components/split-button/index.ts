import { NgModule } from '@angular/core';
import { SplitButtonContentExample } from './split-button-content/split-button-content-example';
import { SplitButtonDisabledStateExample } from './split-button-disabled-state/split-button-disabled-state-example';
import { SplitButtonMenuWidthExample } from './split-button-menu-width/split-button-menu-width-example';
import { SplitButtonOverviewExample } from './split-button-overview/split-button-overview-example';
import { SplitButtonProgressStateExample } from './split-button-progress-state/split-button-progress-state-example';
import { SplitButtonStylesExample } from './split-button-styles/split-button-styles-example';
import { SplitButtonTextOverflowExample } from './split-button-text-overflow/split-button-text-overflow-example';

export {
    SplitButtonContentExample,
    SplitButtonDisabledStateExample,
    SplitButtonMenuWidthExample,
    SplitButtonOverviewExample,
    SplitButtonProgressStateExample,
    SplitButtonStylesExample,
    SplitButtonTextOverflowExample
};

const EXAMPLES = [
    SplitButtonOverviewExample,
    SplitButtonStylesExample,
    SplitButtonContentExample,
    SplitButtonTextOverflowExample,
    SplitButtonDisabledStateExample,
    SplitButtonProgressStateExample,
    SplitButtonMenuWidthExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SplitButtonExamplesModule {}
