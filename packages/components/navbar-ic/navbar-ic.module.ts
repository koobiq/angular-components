import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import {
    KbqNavbarIcDivider,
    KbqNavbarIcFocusableItem,
    KbqNavbarIcHeader,
    KbqNavbarIcItem,
    KbqNavbarIcLogo,
    KbqNavbarIcRectangleElement,
    KbqNavbarIcTitle,
    KbqNavbarIcToggle
} from './navbar-ic-item.component';
import { KbqNavbarIc, KbqNavbarIcContainer } from './navbar-ic.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        KbqIconModule,
        KbqToolTipModule
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
    ],
    declarations: [
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
