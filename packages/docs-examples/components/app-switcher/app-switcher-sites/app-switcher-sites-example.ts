import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { KbaAppSwitcherSite, KbqAppSwitcherApp, KbqAppSwitcherModule } from '@koobiq/components/app-switcher';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title app-switcher-sites
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'app-switcher-sites-example',
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
        Site: {{ selectedSite.name }}
        <br />
        <br />
        <button kbq-button kbqAppSwitcher [sites]="sites" [(selectedSite)]="selectedSite" [(selectedApp)]="selectedApp">
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `
})
export class AppSwitcherSitesExample {
    sites: KbaAppSwitcherSite[] = [
        {
            name: 'СЗФО',
            id: '02',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'SZFO_01',
                    icon: '',
                    type: 'NAD'
                },
                {
                    name: 'CryptoWall',
                    id: 'SZFO_02',
                    type: 'NAD'
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'SZFO_03',
                    type: 'NAD'
                },
                {
                    name: 'App Instance 2',
                    id: 'SZFO_04',
                    type: 'NAD'
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'SZFO_05',
                    type: 'NE-NAD'
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'SZFO_06',
                    type: 'NE-NAD'
                },
                {
                    name: 'Phantom Gate',
                    id: 'SZFO_07',
                    type: 'NE-NAD'
                },
                {
                    name: 'SentraLock',
                    id: 'SZFO_08',
                    caption: 'Lock-sentral-urals',
                    type: 'NE-NAD'
                },
                {
                    name: 'Zero Trace',
                    id: 'SZFO_09',
                    type: ''
                }
            ]
        },
        {
            name: 'ЮФО',
            id: '03',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'UFO_01',
                    type: 'SIEM'
                },
                {
                    name: 'CryptoWall',
                    id: 'UFO_02',
                    type: 'SIEM'
                },
                {
                    name: 'Phantom Gate',
                    id: 'UFO_03',
                    type: 'SIEM'
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'UFO_04',
                    type: 'SIEM'
                },
                {
                    name: 'Zero Trace',
                    id: 'UFO_05',
                    type: ''
                }
            ]
        },
        {
            name: 'Южный Суверенный Федеральный Округ ФО',
            status: 'Главная',
            id: '04',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'USFO_01',
                    type: 'APP'
                },
                {
                    name: 'CryptoWall',
                    id: 'USFO_02',
                    type: 'APP'
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'USFO_03',
                    type: 'APP'
                },
                {
                    name: 'App Instance 2',
                    id: 'USFO_04',
                    type: 'APP'
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'USFO_05',
                    type: 'APP'
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'USFO_06',
                    type: 'APP'
                },
                {
                    name: 'Phantom Gate',
                    id: 'USFO_07',
                    type: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'USFO_08',
                    type: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'USFO_09',
                    type: ''
                }
            ]
        },
        {
            name: 'ПФО',
            id: '05',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'PFO_01',
                    type: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'PFO_02',
                    type: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'PFO_03',
                    type: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'PFO_04',
                    type: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'PFO_05',
                    type: ''
                }
            ]
        },
        {
            name: 'УФО',
            id: '06',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'UFO_01',
                    type: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'UFO_02',
                    type: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'UFO_03',
                    type: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'UFO_04',
                    type: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'UFO_05',
                    type: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'UFO_06',
                    type: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'UFO_07',
                    type: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'UFO_08',
                    type: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'UFO_09',
                    type: ''
                }
            ]
        },
        {
            name: 'СФО',
            id: '07',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'SFO_01',
                    type: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'SFO_02',
                    type: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'SFO_03',
                    type: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'SFO_04',
                    type: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'SFO_05',
                    type: ''
                }
            ]
        },
        {
            name: 'ДФО',
            id: '08',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'DFO_01',
                    type: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'DFO_02',
                    type: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'DFO_03',
                    type: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'DFO_04',
                    type: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'DFO_05',
                    type: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'DFO_06',
                    type: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'DFO_07',
                    type: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'DFO_08',
                    type: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'DFO_09',
                    type: ''
                }
            ]
        }
    ];

    selectedSite: KbaAppSwitcherSite = this.sites[0];
    selectedApp: KbqAppSwitcherApp = this.sites[0].apps[0];
}
