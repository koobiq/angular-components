import { NgModule } from '@angular/core';
import { KbqPseudoCheckbox } from '../selection';
import { KbqOptionActionComponent } from './action';
import { KbqOptgroup } from './optgroup';
import { KbqOption } from './option';

@NgModule({
    imports: [KbqPseudoCheckbox, KbqOption, KbqOptgroup, KbqOptionActionComponent],
    exports: [KbqOption, KbqOptgroup, KbqOptionActionComponent]
})
export class KbqOptionModule {}
