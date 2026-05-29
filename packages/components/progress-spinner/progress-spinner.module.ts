import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqProgressSpinner, KbqProgressSpinnerCaption, KbqProgressSpinnerText } from './progress-spinner.component';

@NgModule({
    imports: [
        PlatformModule,
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
