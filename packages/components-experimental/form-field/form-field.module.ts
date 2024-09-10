import { NgModule } from '@angular/core';
import { KbqCleaner } from './cleaner';
import { KbqError } from './error';
import { KbqFormField } from './form-field';
import { KbqHint } from './hint';
import { KbqLabel } from './label';
import { KbqPasswordHint } from './password-hint';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqStepper } from './stepper';
import { KbqSuffix } from './suffix';

const COMPONENTS = [
    KbqFormField,
    KbqHint,
    KbqError,
    KbqPrefix,
    KbqSuffix,
    KbqCleaner,
    KbqStepper,
    KbqPasswordToggle,
    KbqPasswordHint,
    KbqLabel
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqFormFieldModule {}
