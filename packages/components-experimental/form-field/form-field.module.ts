import { NgModule } from '@angular/core';
import { KbqCleaner } from './cleaner';
import { KbqFormField } from './form-field';
import { KbqError, KbqHint, KbqPasswordHint } from './hint';
import { KbqLabel } from './label';
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
    KbqLabel,
    KbqPasswordHint
];

/**
 * @deprecated Will be removed in the next major release.
 * Module functionality has been moved to the original package (`@koobiq/components/form-field`).
 */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqFormFieldModule {}
