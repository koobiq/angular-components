import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCommonModule } from '@koobiq/components/core';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqButtonToggle, KbqButtonToggleGroup } from './button-toggle.component';

@NgModule({
    imports: [KbqCommonModule, KbqButtonModule, KbqTitleModule],
    exports: [KbqCommonModule, KbqButtonToggleGroup, KbqButtonToggle],
    declarations: [KbqButtonToggleGroup, KbqButtonToggle],
})
export class KbqButtonToggleModule {}
