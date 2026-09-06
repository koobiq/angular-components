import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputMono } from './input';
import { KbqNumberInput } from './input-number';
import { KbqMaxValidator, KbqMinValidator } from './input-number-validators';
import { KbqInputPassword } from './input-password';

@NgModule({
    imports: [
        A11yModule,
        FormsModule,
        KbqIconModule,
        KbqInput,
        KbqNumberInput,
        KbqInputPassword,
        KbqInputMono,
        KbqMinValidator,
        KbqMaxValidator
    ],
    exports: [
        KbqInput,
        KbqNumberInput,
        KbqInputPassword,
        KbqInputMono,
        KbqMinValidator,
        KbqMaxValidator,
        KbqFormFieldModule
    ]
})
export class KbqInputModule {}
