import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbaAppSwitcherSite, KbqAppSwitcherModule } from '@koobiq/components/app-switcher';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { PopoverExamplesModule } from 'packages/docs-examples/components/popover';

@Component({
    standalone: true,
    imports: [PopoverExamplesModule, KbqButtonModule, KbqIcon, KbqAppSwitcherModule],
    selector: 'dev-examples',
    template: `
        <button kbq-button kbqAppSwitcher [search]="true" [sites]="sites" (selectedSiteChanges)="onSelectSite($event)">
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DevExamples {
    sites: KbaAppSwitcherSite[] = [
        {
            name: 'ЦФО',
            id: '01',
            apps: [
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_01',
                    type: 'type_1'
                },
                {
                    name: 'Name',
                    id: 'CFO_02',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'type_1'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_03',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'type_1'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_04',
                    type: 'type_1'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_05',
                    type: 'type_2'
                },
                {
                    name: 'Name',
                    id: 'CFO_06',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'type_2'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_07',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'type_2'
                },
                {
                    name: 'Name',
                    id: 'CFO_08',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'type_2'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_09',
                    type: 'type_3'
                },
                {
                    name: 'Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    id: 'CFO_10',
                    type: 'type_3'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    id: 'CFO_11',
                    type: 'type_3'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_12',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    type: 'type_3'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    id: 'CFO_13',
                    type: 'type_4'
                },
                {
                    name: 'Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    id: 'CFO_14',
                    type: 'type_4'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    id: 'CFO_15',
                    type: 'type_4'
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
                    icon: '',
                    type: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'SZFO_02',
                    type: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'SZFO_03',
                    type: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'SZFO_04',
                    type: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'SZFO_05',
                    type: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'SZFO_06',
                    type: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'SZFO_07',
                    type: ''
                },
                {
                    name: 'SentraLock',
                    id: 'SZFO_08',
                    caption: 'Lock-sentral-urals',
                    type: ''
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
                    type: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'UFO_02',
                    type: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'UFO_03',
                    type: ''
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'UFO_04',
                    type: ''
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
                    type: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'USFO_02',
                    type: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'USFO_03',
                    type: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'USFO_04',
                    type: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'USFO_05',
                    type: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'USFO_06',
                    type: ''
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

    onSelectSite(site) {
        console.log('onSelectSite: ', site);
    }
}

@Component({
    standalone: true,
    selector: 'dev-app',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html',
    imports: [
        A11yModule,
        FormsModule,
        DevExamples,
        KbqAppSwitcherModule,
        KbqDropdownModule,
        KbqDividerModule,
        KbqBadgeModule,
        KbqOptionModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    componentColors = KbqComponentColors;

    modelValue: any = '';
}
