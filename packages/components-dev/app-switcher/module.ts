import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqAppSwitcherModule, KbqAppSwitcherSite } from '@koobiq/components/app-switcher';
import { AppSwitcherExamplesModule } from '../../docs-examples/components/app-switcher';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [AppSwitcherExamplesModule, KbqAppSwitcherModule],
    selector: 'dev-examples',
    template: `
        <app-switcher-overview-example />
        <br />
        <br />
        <app-switcher-sites-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DevExamples {}

@Component({
    standalone: true,
    selector: 'dev-app',
    templateUrl: './template.html',
    imports: [
        DevExamples,
        DevThemeToggle
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    sites: KbqAppSwitcherSite[] = [
        {
            name: 'ЦФО',
            id: '01',
            apps: [
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_01',
                    type: 'NAD',
                    icon: ''
                },
                {
                    name: 'Name',
                    id: 'CFO_02',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'NAD',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_03',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'NAD',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_04',
                    type: 'NAD',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_05',
                    type: 'NE_NAD',
                    icon: ''
                },
                {
                    name: 'Name',
                    id: 'CFO_06',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'NE_NAD',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_07',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'NE_NAD',
                    icon: ''
                },
                {
                    name: 'Name',
                    id: 'CFO_08',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'NE_NAD',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_09',
                    type: 'SIEM',
                    icon: ''
                },
                {
                    name: 'Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    id: 'CFO_10',
                    type: 'SIEM',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    id: 'CFO_11',
                    type: 'SIEM',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_12',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'SIEM',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_13',
                    icon: ''
                },
                {
                    name: 'Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    id: 'CFO_14',
                    icon: ''
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    id: 'CFO_15',
                    icon: ''
                }
            ]
        },
        {
            name: 'СЗФО',
            id: '02',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'SZFO_01',
                    icon: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'SZFO_02',
                    icon: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'SZFO_03',
                    icon: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'SZFO_04',
                    icon: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'SZFO_05',
                    icon: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'SZFO_06',
                    icon: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'SZFO_07',
                    icon: ''
                },
                {
                    name: 'SentraLock',
                    id: 'SZFO_08',
                    caption: 'Lock-sentral-urals',
                    icon: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'SZFO_09',
                    icon: ''
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
                    icon: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'UFO_02',
                    icon: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'UFO_03',
                    icon: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'UFO_04',
                    icon: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'UFO_05',
                    icon: ''
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
                    icon: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'USFO_02',
                    icon: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'USFO_03',
                    icon: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'USFO_04',
                    icon: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'USFO_05',
                    icon: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'USFO_06',
                    icon: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'USFO_07',
                    icon: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'USFO_08',
                    icon: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'USFO_09',
                    icon: ''
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
                    icon: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'PFO_02',
                    icon: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'PFO_03',
                    icon: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'PFO_04',
                    icon: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'PFO_05',
                    icon: ''
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
                    icon: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'UFO_02',
                    icon: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'UFO_03',
                    icon: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'UFO_04',
                    icon: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'UFO_05',
                    icon: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'UFO_06',
                    icon: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'UFO_07',
                    icon: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'UFO_08',
                    icon: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'UFO_09',
                    icon: ''
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
                    icon: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'SFO_02',
                    icon: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'SFO_03',
                    icon: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'SFO_04',
                    icon: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'SFO_05',
                    icon: ''
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
                    icon: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'DFO_02',
                    icon: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'DFO_03',
                    icon: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'DFO_04',
                    icon: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'DFO_05',
                    icon: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'DFO_06',
                    icon: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'DFO_07',
                    icon: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'DFO_08',
                    icon: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'DFO_09',
                    icon: ''
                }
            ]
        }
    ];
}
