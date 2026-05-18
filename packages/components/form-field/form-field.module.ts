import { NgModule } from '@angular/core';
import { KbqCleaner } from './cleaner';
import { KbqError } from './error';
import { KbqFieldset, KbqFieldsetItem, KbqLegend } from './fieldset';
import { KbqFormField, KbqTrim } from './form-field';
import { KbqHint } from './hint';
import { KbqLabel } from './label';
import { KbqPasswordHint } from './password-hint';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqReactivePasswordHint } from './reactive-password-hint';
import { KbqStepper } from './stepper';
import { KbqSuffix } from './suffix';

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
    KbqReactivePasswordHint,
    KbqLegend,
    KbqFieldset,
    KbqFieldsetItem,

    // Legacy components
    KbqPasswordHint,
    KbqTrim
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqFormFieldModule {}
