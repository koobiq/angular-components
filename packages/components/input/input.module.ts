import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputMono } from './input';
import { KbqNumberInput } from './input-number';
import { MaxValidator, MinValidator } from './input-number-validators';
import { KbqInputPassword } from './input-password';

@NgModule({
    imports: [
        A11yModule,
        FormsModule,
        KbqIconModule
    ],
    declarations: [
        KbqInput,
        KbqNumberInput,
        KbqInputPassword,
        KbqInputMono,
        MinValidator,
        MaxValidator
    ],
    exports: [
        KbqInput,
        KbqNumberInput,
        KbqInputPassword,
        KbqInputMono,
        MinValidator,
        MaxValidator
    ]
})
export class KbqInputModule {}
