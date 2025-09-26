import {
    A11yModule,
    ConfigurableFocusTrapFactory,
    FOCUS_TRAP_INERT_STRATEGY,
    FocusTrapFactory
} from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { EmptyFocusTrapStrategy } from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqAppSwitcher,
    KbqAppSwitcherTrigger
} from './app-switcher';
import { KbqAppSwitcherApp } from './app-switcher-app';
import { KbqAppSwitcherDropdownApp } from './app-switcher-dropdown-app';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';

@NgModule({
    imports: [
        KbqAppSwitcher,
        KbqAppSwitcherTrigger,
        KbqAppSwitcherApp,
        KbqAppSwitcherDropdownApp,
        KbqAppSwitcherDropdownSite,
        OverlayModule,
        KbqButtonModule,
        A11yModule,
        KbqIconModule,
        CdkObserveContent,
        NgClass,
        NgTemplateOutlet,
        KbqFormField,
        KbqInputModule,
        FormsModule
    ],
    exports: [
        KbqAppSwitcher,
        KbqAppSwitcherTrigger
    ],
    providers: [
        KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
        { provide: FOCUS_TRAP_INERT_STRATEGY, useClass: EmptyFocusTrapStrategy }]
})
export class KbqAppSwitcherModule {}
