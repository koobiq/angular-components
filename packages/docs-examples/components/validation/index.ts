import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { ValidationCompositeExample } from './validation-composite/validation-composite-example';
import { ValidationGlobalOneRequiredExample } from './validation-global-one-required/validation-global-one-required-example';
import { ValidationGlobalExample } from './validation-global/validation-global-example';
import { ValidationOnBlurExample } from './validation-on-blur/validation-on-blur-example';
import { ValidationOnTypeExample } from './validation-on-type/validation-on-type-example';
import { ValidationOverviewExample } from './validation-overview/validation-overview-example';
import { ValidationSmallExample } from './validation-small/validation-small-example';

export {
    ValidationCompositeExample,
    ValidationGlobalExample,
    ValidationGlobalOneRequiredExample,
    ValidationOnBlurExample,
    ValidationOnTypeExample,
    ValidationOverviewExample,
    ValidationSmallExample
};

const EXAMPLES = [
    ValidationOverviewExample,
    ValidationCompositeExample,
    ValidationGlobalExample,
    ValidationOnBlurExample,
    ValidationOnTypeExample,
    ValidationSmallExample,
    ValidationGlobalOneRequiredExample
];

@NgModule({
    imports: [
        ReactiveFormsModule,
        FormsModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqFormsModule,
        KbqToolTipModule,
        KbqSelectModule,
        KbqIconModule,
        KbqButtonModule,
        KbqTextareaModule,
        KbqAlertModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ValidationExamplesModule {}
