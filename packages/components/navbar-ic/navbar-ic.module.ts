import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqNavbarIc, KbqNavbarIcContainer } from './navbar-ic';
import { KbqNavbarIcHeader } from './navbar-ic-header';
import {
    KbqNavbarIcDivider,
    KbqNavbarIcFocusableItem,
    KbqNavbarIcItem,
    KbqNavbarIcLogo,
    KbqNavbarIcRectangleElement,
    KbqNavbarIcTitle,
    KbqNavbarIcToggle
} from './navbar-ic-item';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        KbqIconModule,
        KbqToolTipModule,
        KbqNavbarIc,
        KbqNavbarIcTitle,
        KbqNavbarIcItem,
        KbqNavbarIcHeader,
        KbqNavbarIcLogo,
        KbqNavbarIcToggle,
        KbqNavbarIcDivider,
        KbqNavbarIcFocusableItem,
        KbqNavbarIcRectangleElement,
        KbqNavbarIcContainer
    ],
    exports: [
        KbqNavbarIc,
        KbqNavbarIcContainer,
        KbqNavbarIcTitle,
        KbqNavbarIcItem,
        KbqNavbarIcHeader,
        KbqNavbarIcLogo,
        KbqNavbarIcToggle,
        KbqNavbarIcDivider,
        KbqNavbarIcFocusableItem,
        KbqNavbarIcRectangleElement
    ]
})
export class KbqNavbarIcModule {}
