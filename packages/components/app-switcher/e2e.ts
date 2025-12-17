import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqAppSwitcherApp,
    KbqAppSwitcherComponent,
    KbqAppSwitcherModule,
    KbqAppSwitcherSite
} from '@koobiq/components/app-switcher';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'e2e-app-switcher-states',
    imports: [KbqAppSwitcherModule, KbqButtonModule, KbqIconModule, KbqAppSwitcherComponent],
    template: `
        <div data-testid="e2eScreenshotTarget" style="width: 330px; height: 390px; padding: 8px">
            <button #trigger="kbqAppSwitcher" kbq-button kbqAppSwitcher [apps]="apps" [(selectedApp)]="selected">
                <i kbq-icon="kbq-bento-menu_16"></i>
            </button>

            <kbq-app-switcher [trigger]="trigger" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAppSwitcherStates'
    }
})
export class E2eAppSwitcherStates {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SVGIcon: string = `
        <svg fill="none" height="24" viewBox="0 0 32 32" width="24" xmlns="http://www.w3.org/2000/svg">
            <path clip-rule="evenodd"
                d="M0 25.6C0 28.4045 0 29.9635 1.01826 30.9817C2.03651 32 3.59554 32 6.4 32H25.6C28.4045 32 29.9635 32 30.9817 30.9817C32 29.9635 32 28.4045 32 25.6V6.4C32 3.59554 32 2.03651 30.9817 1.01826C29.9635 0 28.4045 0 25.6 0H6.4C3.59554 0 2.03651 0 1.01826 1.01826C0 2.03651 0 3.59554 0 6.4V25.6Z"
                fill-rule="evenodd" fill="#212121" />
            <path
                d="M14.9774 16L11.1933 19.7841L7.40918 16L11.1933 12.267L14.9774 16ZM19.7842 20.858L16.0512 24.5909L12.2671 20.858L16.0512 17.0739L19.7842 20.858ZM19.7842 11.1932L16.0512 14.9261L12.2671 11.1932L16.0512 7.40909L19.7842 11.1932ZM24.591 16L20.858 19.7841L17.1251 16L20.858 12.267L24.591 16Z"
                fill="white" />
        </svg>
    `;
    apps: KbqAppSwitcherApp[] = [
        {
            name: 'Byte Sentinel',
            caption: 'Byte 001',
            id: 'SZFO_01',
            icon: this.SVGIcon
        },
        {
            name: 'CryptoWall',
            id: 'SZFO_02',
            icon: this.SVGIcon
        },
        {
            name: 'App Instance 1',
            caption: 'Instance Alias One',
            id: 'SZFO_03',
            icon: this.SVGIcon
        },
        {
            name: 'App Instance 2',
            id: 'SZFO_04',
            icon: this.SVGIcon
        },
        {
            name: 'App Instance 3',
            caption: 'Instance Alias Three',
            id: 'SZFO_05',
            icon: this.SVGIcon
        },
        {
            name: 'App Instance 4',
            caption: 'Instance Alias Four',
            id: 'SZFO_06',
            icon: this.SVGIcon
        },
        {
            name: 'Phantom Gate',
            id: 'SZFO_07',
            icon: this.SVGIcon
        }
    ];
    selected: KbqAppSwitcherApp = this.apps[0];
}

@Component({
    selector: 'e2e-app-switcher-with-sites-states',
    imports: [KbqAppSwitcherModule, KbqButtonModule, KbqIconModule, KbqAppSwitcherComponent],
    template: `
        <div data-testid="e2eScreenshotTarget" style="width: 330px; height: 912px; padding: 8px">
            <button
                #trigger="kbqAppSwitcher"
                kbq-button
                kbqAppSwitcher
                [sites]="sites"
                [(selectedSite)]="selectedSite"
                [(selectedApp)]="selectedApp"
            >
                <i kbq-icon="kbq-bento-menu_16"></i>
            </button>

            <kbq-app-switcher [trigger]="trigger" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAppSwitcherWithSitesStates'
    }
})
export class E2eAppSwitcherWithSitesStates {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SVGIcon: string = `
        <svg fill="none" height="24" viewBox="0 0 32 32" width="24" xmlns="http://www.w3.org/2000/svg">
            <path clip-rule="evenodd"
                d="M0 25.6C0 28.4045 0 29.9635 1.01826 30.9817C2.03651 32 3.59554 32 6.4 32H25.6C28.4045 32 29.9635 32 30.9817 30.9817C32 29.9635 32 28.4045 32 25.6V6.4C32 3.59554 32 2.03651 30.9817 1.01826C29.9635 0 28.4045 0 25.6 0H6.4C3.59554 0 2.03651 0 1.01826 1.01826C0 2.03651 0 3.59554 0 6.4V25.6Z"
                fill-rule="evenodd" fill="#212121" />
            <path
                d="M14.9774 16L11.1933 19.7841L7.40918 16L11.1933 12.267L14.9774 16ZM19.7842 20.858L16.0512 24.5909L12.2671 20.858L16.0512 17.0739L19.7842 20.858ZM19.7842 11.1932L16.0512 14.9261L12.2671 11.1932L16.0512 7.40909L19.7842 11.1932ZM24.591 16L20.858 19.7841L17.1251 16L20.858 12.267L24.591 16Z"
                fill="white" />
        </svg>
    `;

    sites: KbqAppSwitcherSite[] = [
        {
            name: 'СЗФО',
            id: '02',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'SZFO_01',
                    type: 'NAD',
                    icon: this.SVGIcon
                },
                {
                    name: 'CryptoWall',
                    id: 'SZFO_02',
                    type: 'NAD',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'SZFO_03',
                    type: 'NAD',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 2',
                    id: 'SZFO_04',
                    type: 'NAD',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'SZFO_05',
                    type: 'NE-NAD',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'SZFO_06',
                    type: 'NE-NAD',
                    icon: this.SVGIcon
                },
                {
                    name: 'Phantom Gate',
                    id: 'SZFO_07',
                    type: 'NE-NAD',
                    icon: this.SVGIcon
                },
                {
                    name: 'SentraLock',
                    id: 'SZFO_08',
                    caption: 'Lock-sentral-urals',
                    type: 'NE-NAD',
                    icon: this.SVGIcon
                },
                {
                    name: 'Zero Trace',
                    id: 'SZFO_09',
                    type: '',
                    icon: this.SVGIcon
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
                    type: 'SIEM',
                    icon: this.SVGIcon
                },
                {
                    name: 'CryptoWall',
                    id: 'UFO_02',
                    type: 'SIEM',
                    icon: this.SVGIcon
                },
                {
                    name: 'Phantom Gate',
                    id: 'UFO_03',
                    type: 'SIEM',
                    icon: this.SVGIcon
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'UFO_04',
                    type: 'SIEM',
                    icon: this.SVGIcon
                },
                {
                    name: 'Zero Trace',
                    id: 'UFO_05',
                    type: '',
                    icon: this.SVGIcon
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
                    type: 'APP',
                    icon: this.SVGIcon
                },
                {
                    name: 'CryptoWall',
                    id: 'USFO_02',
                    type: 'APP',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'USFO_03',
                    type: 'APP',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 2',
                    id: 'USFO_04',
                    type: 'APP',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'USFO_05',
                    type: 'APP',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'USFO_06',
                    type: 'APP',
                    icon: this.SVGIcon
                },
                {
                    name: 'Phantom Gate',
                    id: 'USFO_07',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'USFO_08',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'Zero Trace',
                    id: 'USFO_09',
                    type: '',
                    icon: this.SVGIcon
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
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'CryptoWall',
                    id: 'PFO_02',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'Phantom Gate',
                    id: 'PFO_03',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'PFO_04',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'Zero Trace',
                    id: 'PFO_05',
                    type: '',
                    icon: this.SVGIcon
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
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'CryptoWall',
                    id: 'UFO_02',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'UFO_03',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 2',
                    id: 'UFO_04',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'UFO_05',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'UFO_06',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'Phantom Gate',
                    id: 'UFO_07',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals',
                    id: 'UFO_08',
                    type: '',
                    icon: this.SVGIcon
                },
                {
                    name: 'Zero Trace',
                    id: 'UFO_09',
                    type: '',
                    icon: this.SVGIcon
                }
            ]
        }
    ];

    selectedSite: KbqAppSwitcherSite = this.sites[0];
    selectedApp: KbqAppSwitcherApp = this.sites[0].apps[0];
}
