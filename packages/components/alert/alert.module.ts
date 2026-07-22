import { NgModule } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton, KbqAlertControl, KbqAlertTitle } from './alert.component';

@NgModule({
    imports: [
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
