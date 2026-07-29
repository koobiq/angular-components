import { NgModule } from '@angular/core';
import { KbqAppSwitcherComponent, KbqAppSwitcherTrigger, provideKbqAppSwitcher } from './app-switcher';
import { KbqAppSwitcherDropdownApp } from './app-switcher-dropdown-app';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';
import { KbqAppSwitcherListItem } from './app-switcher-list-item';

@NgModule({
    imports: [
        KbqAppSwitcherComponent,
        KbqAppSwitcherTrigger,
        KbqAppSwitcherListItem,
        KbqAppSwitcherDropdownApp,
        KbqAppSwitcherDropdownSite
    ],
    providers: provideKbqAppSwitcher(),
    exports: [
        KbqAppSwitcherTrigger
    ]
})
export class KbqAppSwitcherModule {}
