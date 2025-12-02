import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { KbqRadioButton, KbqRadioGroup } from './radio.component';

@NgModule({
    imports: [A11yModule, KbqRadioGroup, KbqRadioButton],
    exports: [KbqRadioGroup, KbqRadioButton]
})
export class KbqRadioModule {}
