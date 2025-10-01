import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { KbqAppSwitcherApp, KbqAppSwitcherModule } from '@koobiq/components/app-switcher';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title app-switcher
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'app-switcher-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqAutocompleteModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqFormsModule,
        KbqAppSwitcherModule,
        KbqButtonModule,
        KbqIcon
    ],
    template: `
        App: {{ selectedApp.name }}
        <br />
        <br />
        <button kbq-button kbqAppSwitcher [apps]="apps" [(selectedApp)]="selectedApp">
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `
})
export class AppSwitcherOverviewExample {
    apps: KbqAppSwitcherApp[] = [
        {
            name: 'Byte Sentinel',
            caption: 'Byte 001',
            id: 'SZFO_01',
            icon: ''
        },
        {
            name: 'CryptoWall',
            id: 'SZFO_02'
        },
        {
            name: 'App Instance 1',
            caption: 'Instance Alias One',
            id: 'SZFO_03'
        },
        {
            name: 'App Instance 2',
            id: 'SZFO_04'
        },
        {
            name: 'App Instance 3',
            caption: 'Instance Alias Three',
            id: 'SZFO_05'
        },
        {
            name: 'App Instance 4',
            caption: 'Instance Alias Four',
            id: 'SZFO_06'
        },
        {
            name: 'Phantom Gate',
            id: 'SZFO_07'
        }
    ];
    selectedApp: KbqAppSwitcherApp = this.apps[0];
}
