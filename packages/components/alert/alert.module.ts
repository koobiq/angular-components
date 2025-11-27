import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton, KbqAlertControl, KbqAlertTitle } from './alert.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        KbqAlert,
        KbqAlertTitle,
        KbqAlertCloseButton,
        KbqAlertControl
    ],
    exports: [
        KbqAlert,
        KbqAlertTitle,
        KbqAlertCloseButton,
        KbqAlertControl
    ]
})
export class KbqAlertModule {}
