import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import {
    KbqNavbarBento,
    KbqNavbarBrand,
    KbqNavbarDivider,
    KbqNavbarFocusableItem,
    KbqNavbarItem,
    KbqNavbarLogo,
    KbqNavbarRectangleElement,
    KbqNavbarTitle,
    KbqNavbarToggle
} from './navbar-item.component';
import { KbqNavbar, KbqNavbarContainer } from './navbar.component';
import { KbqVerticalNavbar } from './vertical-navbar.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
        KbqIconModule,
        KbqToolTipModule
    ],
    exports: [
        KbqNavbar,
        KbqNavbarContainer,
        KbqNavbarTitle,
        KbqNavbarItem,
        KbqNavbarBrand,
        KbqNavbarLogo,
        KbqNavbarToggle,
        KbqVerticalNavbar,
        KbqNavbarDivider,
        KbqNavbarFocusableItem,
        KbqNavbarRectangleElement,
        KbqNavbarBento
    ],
    declarations: [
        KbqNavbar,
        KbqNavbarContainer,
        KbqNavbarTitle,
        KbqNavbarItem,
        KbqNavbarBrand,
        KbqNavbarLogo,
        KbqNavbarToggle,
        KbqVerticalNavbar,
        KbqNavbarDivider,
        KbqNavbarFocusableItem,
        KbqNavbarRectangleElement,
        KbqNavbarBento
    ]
})
export class KbqNavbarModule {}
