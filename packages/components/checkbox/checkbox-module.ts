import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqColorDirective } from '../core/common-behaviors/color';
import { KbqCheckbox } from './checkbox';
import { KbqCheckboxRequiredValidator } from './checkbox-required-validator';

@NgModule({
    imports: [CommonModule, KbqColorDirective],
    exports: [KbqCheckbox, KbqCheckboxRequiredValidator],
    declarations: [KbqCheckbox, KbqCheckboxRequiredValidator]
})
export class KbqCheckboxModule {}
