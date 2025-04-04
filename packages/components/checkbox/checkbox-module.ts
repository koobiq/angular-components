import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqColorDirective } from '@koobiq/components/core';
import { KbqCheckbox } from './checkbox';
import { KbqCheckboxRequiredValidator } from './checkbox-required-validator';

@NgModule({
    imports: [CommonModule, KbqColorDirective],
    exports: [KbqCheckbox, KbqCheckboxRequiredValidator],
    declarations: [KbqCheckbox, KbqCheckboxRequiredValidator]
})
export class KbqCheckboxModule {}
