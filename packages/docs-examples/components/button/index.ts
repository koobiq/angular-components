import { NgModule } from '@angular/core';
import { ButtonContentExample } from './button-content/button-content-example';
import { ButtonFillAndStyleExample } from './button-fill-and-style/button-fill-and-style-example';
import { ButtonFillContentExample } from './button-fill-content/button-fill-content-example';
import { ButtonFixedContentExample } from './button-fixed-content/button-fixed-content-example';
import { ButtonHugContentExample } from './button-hug-content/button-hug-content-example';
import { ButtonLoadingStateExample } from './button-loading-state/button-loading-state-example';
import { ButtonOverviewExample } from './button-overview/button-overview-example';

export {
    ButtonContentExample,
    ButtonFillAndStyleExample,
    ButtonFillContentExample,
    ButtonFixedContentExample,
    ButtonHugContentExample,
    ButtonLoadingStateExample,
    ButtonOverviewExample
};

const EXAMPLES = [
    ButtonOverviewExample,
    ButtonFillAndStyleExample,
    ButtonContentExample,
    ButtonFillContentExample,
    ButtonFixedContentExample,
    ButtonHugContentExample,
    ButtonLoadingStateExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ButtonExamplesModule {}
