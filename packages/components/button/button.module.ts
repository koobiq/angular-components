import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqButtonGroup } from './button-group';
import { KbqButton, KbqButtonCssStyler } from './button.component';
import { KbqButtonDropdownTrigger } from './button.dropdown-trigger.directive';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        ObserversModule,
        KbqButtonDropdownTrigger,
        KbqButton,
        KbqButtonCssStyler,
        KbqButtonGroup
    ],
    exports: [
        KbqButton,
        KbqButtonCssStyler,
        KbqButtonDropdownTrigger,
        KbqButtonGroup
    ]
})
export class KbqButtonModule {}
