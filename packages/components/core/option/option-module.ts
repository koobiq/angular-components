import { NgModule } from '@angular/core';
import { KbqPseudoCheckbox } from '../selection';
import { KbqOptionActionComponent } from './action';
import { KbqOptgroup, KbqOptgroupLabel } from './optgroup';
import { KbqOption } from './option';

@NgModule({
    imports: [KbqPseudoCheckbox, KbqOption, KbqOptgroup, KbqOptgroupLabel, KbqOptionActionComponent],
    exports: [KbqOption, KbqOptgroup, KbqOptgroupLabel, KbqOptionActionComponent]
})
export class KbqOptionModule {}
