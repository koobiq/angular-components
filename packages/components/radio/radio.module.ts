import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqCommonModule } from '@koobiq/components/core';
import { KbqRadioButton, KbqRadioGroup } from './radio.component';

@NgModule({
    imports: [CommonModule, A11yModule, KbqCommonModule],
    exports: [KbqRadioGroup, KbqRadioButton],
    declarations: [KbqRadioGroup, KbqRadioButton],
})
export class KbqRadioModule {}
