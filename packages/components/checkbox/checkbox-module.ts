import { NgModule } from '@angular/core';
import { KbqCheckbox } from './checkbox';
import { KbqCheckboxRequiredValidator } from './checkbox-required-validator';

@NgModule({
    imports: [KbqCheckbox, KbqCheckboxRequiredValidator],
    exports: [KbqCheckbox, KbqCheckboxRequiredValidator]
})
export class KbqCheckboxModule {}
