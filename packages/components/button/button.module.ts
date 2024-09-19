import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqButton, KbqButtonCssStyler } from './button.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        ObserversModule
    ],
    exports: [
        KbqButton,
        KbqButtonCssStyler
    ],
    declarations: [
        KbqButton,
        KbqButtonCssStyler
    ]
})
export class KbqButtonModule {}
