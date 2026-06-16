import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqButtonGroup, KbqButtonGroupRoot } from './button-group';
import { KbqButtonPrefix, KbqButtonSuffix } from './button-slots';
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
        KbqButtonPrefix,
        KbqButtonSuffix,
        KbqButtonGroup,
        KbqButtonGroupRoot
    ],
    exports: [
        KbqButton,
        KbqButtonCssStyler,
        KbqButtonPrefix,
        KbqButtonSuffix,
        KbqButtonDropdownTrigger,
        KbqButtonGroup,
        KbqButtonGroupRoot
    ]
})
export class KbqButtonModule {}
