import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqCheckbox } from './checkbox';
import { KbqCheckboxRequiredValidator } from './checkbox-required-validator';

@NgModule({
    imports: [CommonModule, KbqCheckbox, KbqCheckboxRequiredValidator],
    exports: [KbqCheckbox, KbqCheckboxRequiredValidator]
})
export class KbqCheckboxModule {}
