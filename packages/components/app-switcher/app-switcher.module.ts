import { ConfigurableFocusTrapFactory, FOCUS_TRAP_INERT_STRATEGY, FocusTrapFactory } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { EmptyFocusTrapStrategy } from '@koobiq/components/core';
import {
    KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqAppSwitcherComponent,
    KbqAppSwitcherTrigger
} from './app-switcher';
import { KbqAppSwitcherDropdownApp } from './app-switcher-dropdown-app';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';
import { KbqAppSwitcherListItem } from './kbq-app-switcher-list-item';

@NgModule({
    imports: [
        KbqAppSwitcherComponent,
        KbqAppSwitcherTrigger,
        KbqAppSwitcherListItem,
        KbqAppSwitcherDropdownApp,
        KbqAppSwitcherDropdownSite
    ],
    exports: [
        KbqAppSwitcherTrigger
    ],
    providers: [
        KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
        { provide: FOCUS_TRAP_INERT_STRATEGY, useClass: EmptyFocusTrapStrategy }]
})
export class KbqAppSwitcherModule {}
