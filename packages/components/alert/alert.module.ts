import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton, KbqAlertControl, KbqAlertTitle } from './alert.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [
        KbqAlert,
        KbqAlertTitle,
        KbqAlertCloseButton,
        KbqAlertControl
    ],
    declarations: [
        KbqAlert,
        KbqAlertTitle,
        KbqAlertCloseButton,
        KbqAlertControl
    ]
})
export class KbqAlertModule {}
