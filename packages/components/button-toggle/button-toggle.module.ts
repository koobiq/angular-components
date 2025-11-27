import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqButtonToggle, KbqButtonToggleGroup } from './button-toggle.component';

@NgModule({
    imports: [KbqButtonModule, KbqTitleModule, KbqButtonToggleGroup, KbqButtonToggle],
    exports: [KbqButtonToggleGroup, KbqButtonToggle]
})
export class KbqButtonToggleModule {}
