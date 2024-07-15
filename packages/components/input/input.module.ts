import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCommonModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputMono } from './input';
import { KbqNumberInput } from './input-number';
import { MaxValidator, MinValidator } from './input-number-validators';
import { KbqInputPassword } from './input-password';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        KbqCommonModule,
        FormsModule,
        KbqIconModule,
    ],
    declarations: [
        KbqInput,
        KbqNumberInput,
        KbqInputPassword,
        KbqInputMono,
        MinValidator,
        MaxValidator,
    ],
    exports: [
        KbqInput,
        KbqNumberInput,
        KbqInputPassword,
        KbqInputMono,
        MinValidator,
        MaxValidator,
    ],
})
export class KbqInputModule {}
