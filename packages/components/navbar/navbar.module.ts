import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqNavbarBrand } from './navbar-brand.component';
import {
    KbqNavbarBento,
    KbqNavbarDivider,
    KbqNavbarFocusableItem,
    KbqNavbarItem,
    KbqNavbarLogo,
    KbqNavbarRectangleElement,
    KbqNavbarTitle
} from './navbar-item.component';
import { KbqNavbarToggle } from './navbar-toggle.component';
import { KbqNavbar, KbqNavbarContainer } from './navbar.component';
import { KbqVerticalNavbar } from './vertical-navbar.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        KbqIconModule,
        KbqToolTipModule,
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
    ]
})
export class KbqNavbarModule {}
