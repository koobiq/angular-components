import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqPseudoCheckbox } from './pseudo-checkbox';

@NgModule({
    imports: [CommonModule, KbqPseudoCheckbox],
    exports: [KbqPseudoCheckbox]
})
export class KbqPseudoCheckboxModule {}
