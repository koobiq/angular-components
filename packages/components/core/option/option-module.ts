import { NgModule } from '@angular/core';
import { KbqPseudoCheckboxModule } from '../selection';
import { KbqOptionActionComponent } from './action';
import { KbqOptgroup } from './optgroup';
import { KbqOption } from './option';

@NgModule({
    imports: [KbqPseudoCheckboxModule],
    declarations: [KbqOption, KbqOptgroup, KbqOptionActionComponent],
    exports: [KbqOption, KbqOptgroup, KbqOptionActionComponent]
})
export class KbqOptionModule {}
