import { PlatformModule } from '@angular/cdk/platform';
import { NgStyle } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqProgressSpinner, KbqProgressSpinnerCaption, KbqProgressSpinnerText } from './progress-spinner.component';

@NgModule({
    imports: [
        PlatformModule,
        NgStyle,
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
