import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqPseudoCheckbox } from './pseudo-checkbox';

@NgModule({
    imports: [CommonModule],
    exports: [KbqPseudoCheckbox],
    declarations: [KbqPseudoCheckbox]
})
export class KbqPseudoCheckboxModule {}
