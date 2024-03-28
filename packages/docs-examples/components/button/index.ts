import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqIconModule } from '@koobiq/components/icon';

import { ButtonContentExample } from './button-content/button-content-example';
import { ButtonFillAndStyleExample } from './button-fill-and-style/button-fill-and-style-example';
import { ButtonFillContentExample } from './button-fill-content/button-fill-content-example';
import { ButtonFixedContentExample } from './button-fixed-content/button-fixed-content-example';
import { ButtonHugContentExample } from './button-hug-content/button-hug-content-example';
import { ButtonLoadingStateExample } from './button-loading-state/button-loading-state-example';
import { ButtonOverviewExample } from './button-overview/button-overview-example';


export {
    ButtonOverviewExample,
    ButtonFillAndStyleExample,
    ButtonContentExample,
    ButtonFillContentExample,
    ButtonFixedContentExample,
    ButtonHugContentExample,
    ButtonLoadingStateExample
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
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqCheckboxModule,
        KbqIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ButtonExamplesModule {}
