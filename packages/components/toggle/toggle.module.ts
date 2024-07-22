import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqCommonModule } from '@koobiq/components/core';
import { KbqToggleComponent } from './toggle.component';

@NgModule({
    imports: [CommonModule, A11yModule, KbqCommonModule],
    exports: [KbqToggleComponent],
    declarations: [KbqToggleComponent]
})
export class KbqToggleModule {}
