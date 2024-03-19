import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    KbqProgressSpinner,
    KbqProgressSpinnerCaption,
    KbqProgressSpinnerText
} from './progress-spinner.component';


@NgModule({
    imports: [
        CommonModule,
        PlatformModule
    ],
    declarations: [
        KbqProgressSpinner,
        KbqProgressSpinnerText,
        KbqProgressSpinnerCaption
    ],
    exports: [
        KbqProgressSpinner,
        KbqProgressSpinnerText,
        KbqProgressSpinnerCaption
    ]
})
export class KbqProgressSpinnerModule {}
