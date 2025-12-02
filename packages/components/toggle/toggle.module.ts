import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { KbqToggleComponent } from './toggle.component';

@NgModule({
    imports: [A11yModule, KbqToggleComponent],
    exports: [KbqToggleComponent]
})
export class KbqToggleModule {}
