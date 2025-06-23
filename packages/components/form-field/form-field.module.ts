import { NgModule } from '@angular/core';
import { KbqCleaner } from './cleaner';
import { KbqError } from './error';
import { KbqFormField, KbqFormFieldWithoutBorders, KbqTrim } from './form-field';
import { KbqHint } from './hint';
import { KbqLabel } from './label';
import { KbqPasswordHint } from './password-hint';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqStepper } from './stepper';
import { KbqSuffix } from './suffix';
import { KbqValidateDirective } from './validate.directive';

const COMPONENTS = [
    KbqCleaner,
    KbqFormField,
    KbqPrefix,
    KbqSuffix,
    KbqPasswordToggle,
    KbqStepper,
    KbqLabel,
    KbqHint,
    KbqError,

    // Legacy components
    KbqPasswordHint,
    KbqFormFieldWithoutBorders,
    KbqValidateDirective,
    KbqTrim
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqFormFieldModule {}
