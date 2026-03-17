import { NgModule } from '@angular/core';
import { ButtonContentExample } from './button-content/button-content-example';
import { ButtonFillAndStyleOnlyIconExample } from './button-fill-and-style-only-icon/button-fill-and-style-only-icon-example';
import { ButtonFillAndStyleExample } from './button-fill-and-style/button-fill-and-style-example';
import { ButtonFillContentExample } from './button-fill-content/button-fill-content-example';
import { ButtonFixedContentExample } from './button-fixed-content/button-fixed-content-example';
import { ButtonGroupContentExample } from './button-group-content/button-group-content-example';
import { ButtonGroupCustomContentExample } from './button-group-custom-content/button-group-custom-content-example';
import { ButtonGroupOverviewExample } from './button-group-overview/button-group-overview-example';
import { ButtonGroupStyleExample } from './button-group-style/button-group-style-example';
import { ButtonGroupVerticalExample } from './button-group-vertical/button-group-vertical-example';
import { ButtonHugContentExample } from './button-hug-content/button-hug-content-example';
import { ButtonLoadingStateExample } from './button-loading-state/button-loading-state-example';
import { ButtonOverviewExample } from './button-overview/button-overview-example';

export {
    ButtonContentExample,
    ButtonFillAndStyleExample,
    ButtonFillAndStyleOnlyIconExample,
    ButtonFillContentExample,
    ButtonFixedContentExample,
    ButtonGroupContentExample,
    ButtonGroupCustomContentExample,
    ButtonGroupOverviewExample,
    ButtonGroupStyleExample,
    ButtonGroupVerticalExample,
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
    ButtonLoadingStateExample,
    ButtonFillAndStyleOnlyIconExample,
    ButtonGroupOverviewExample,
    ButtonGroupStyleExample,
    ButtonGroupContentExample,
    ButtonGroupCustomContentExample,
    ButtonGroupVerticalExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ButtonExamplesModule {}
