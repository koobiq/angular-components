import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqButtonGroup, KbqButtonGroupRoot } from './button-group';
import { KbqButtonLeftIcon, KbqButtonRightIcon } from './button-icon';
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
        KbqButtonLeftIcon,
        KbqButtonRightIcon,
        KbqButtonGroup,
        KbqButtonGroupRoot
    ],
    exports: [
        KbqButton,
        KbqButtonCssStyler,
        KbqButtonLeftIcon,
        KbqButtonRightIcon,
        KbqButtonDropdownTrigger,
        KbqButtonGroup,
        KbqButtonGroupRoot
    ]
})
export class KbqButtonModule {}
