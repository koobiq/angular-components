import { NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqCleaner } from './cleaner';
import { KbqFormField, KbqFormFieldWithoutBorders, KbqTrim } from './form-field';
import { KbqHint } from './hint';
import { KbqPasswordHint } from './password-hint';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqStepper } from './stepper';
import { KbqSuffix } from './suffix';
import { KbqValidateDirective } from './validate.directive';

@NgModule({
    declarations: [
        KbqFormField,
        KbqFormFieldWithoutBorders,
        KbqHint,
        KbqPasswordHint,
        KbqPrefix,
        KbqSuffix,
        KbqCleaner,
        KbqStepper,
        KbqValidateDirective,
        KbqTrim,
        KbqPasswordToggle
    ],
    imports: [
        KbqIconModule,
        NgClass
    ],
    exports: [
        KbqFormField,
        KbqFormFieldWithoutBorders,
        KbqHint,
        KbqPasswordHint,
        KbqPrefix,
        KbqSuffix,
        KbqCleaner,
        KbqStepper,
        KbqValidateDirective,
        KbqTrim,
        KbqPasswordToggle
    ]
})
export class KbqFormFieldModule {}
