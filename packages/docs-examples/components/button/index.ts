import { NgModule } from '@angular/core';
import { ButtonContentExample } from './button-content/button-content-example';
import { ButtonFillAndStyleOnlyIconExample } from './button-fill-and-style-only-icon/button-fill-and-style-only-icon-example';
import { ButtonFillAndStyleExample } from './button-fill-and-style/button-fill-and-style-example';
import { ButtonFillContentExample } from './button-fill-content/button-fill-content-example';
import { ButtonFixedContentExample } from './button-fixed-content/button-fixed-content-example';
import { ButtonHugContentExample } from './button-hug-content/button-hug-content-example';
import { ButtonLoadingStateExample } from './button-loading-state/button-loading-state-example';
import { ButtonOverviewExample } from './button-overview/button-overview-example';
import { ButtonStateAndStyleExample } from './button-state-and-style/button-state-and-style-example';

export {
    ButtonContentExample,
    ButtonFillAndStyleExample,
    ButtonFillAndStyleOnlyIconExample,
    ButtonFillContentExample,
    ButtonFixedContentExample,
    ButtonHugContentExample,
    ButtonLoadingStateExample,
    ButtonOverviewExample,
    ButtonStateAndStyleExample
};

const EXAMPLES = [
    ButtonOverviewExample,
    ButtonFillAndStyleExample,
    ButtonContentExample,
    ButtonFillContentExample,
    ButtonFixedContentExample,
    ButtonHugContentExample,
    ButtonLoadingStateExample,
    ButtonFillAndStyleOnlyIconExample,
    ButtonStateAndStyleExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ButtonExamplesModule {}
