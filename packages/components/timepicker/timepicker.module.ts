import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqTimepicker } from './timepicker.directive';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        FormsModule
    ],
    declarations: [KbqTimepicker],
    exports: [KbqTimepicker]
})
export class KbqTimepickerModule {}
