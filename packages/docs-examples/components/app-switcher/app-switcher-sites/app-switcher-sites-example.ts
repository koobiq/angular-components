import { ChangeDetectionStrategy, Component, computed, linkedSignal } from '@angular/core';
import { KbqAppSwitcherApp, KbqAppSwitcherModule, KbqAppSwitcherSite } from '@koobiq/components/app-switcher';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from '../localized-data';

/** @title app-switcher-sites */
@Component({
    selector: 'app-switcher-sites-example',
    imports: [
        KbqAppSwitcherModule,
        KbqButtonModule,
        KbqIcon,
        KbqToolTipModule
    ],
    template: `
        {{ text().app }} {{ selectedApp()?.name }}
        <br />
        {{ text().site }} {{ selectedSite()?.name }}
        <br />
        <br />
        <button
            kbq-button
            kbqAppSwitcher
            [attr.aria-label]="text().allApps"
            [kbqTooltip]="text().allApps"
            [sites]="sites()"
            [(selectedSite)]="selectedSite"
            [(selectedApp)]="selectedApp"
        >
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSwitcherSitesExample {
    protected readonly text = injectExampleText();

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

    protected readonly sites = computed<KbqAppSwitcherSite[]>(() => {
        const text = this.text();

        return [
            {
                name: text.sites.northwest,
                id: '02',
                apps: [
                    {
                        name: 'Byte Sentinel',
                        caption: 'Byte 001',
                        id: 'SZFO_01',
                        type: 'NAD',
                        iconSrc: 'https://koobiq.io/assets/images/favicons/icon.svg'
                    },
                    {
                        name: 'CryptoWall',
                        id: 'SZFO_02',
                        type: 'NAD',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(1),
                        caption: text.instanceAliasOne,
                        id: 'SZFO_03',
                        type: 'NAD',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(2),
                        id: 'SZFO_04',
                        type: 'NAD',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(3),
                        caption: text.instanceAliasThree,
                        id: 'SZFO_05',
                        type: 'NE-NAD',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(4),
                        caption: text.instanceAliasFour,
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
                name: text.sites.south,
                id: '03',
                apps: [
                    {
                        name: 'Byte Sentinel',
                        caption: 'Byte 001',
                        id: 'UFO_01',
                        type: 'SIEM',
                        iconSrc: 'https://koobiq.io/assets/images/favicons/icon.svg'
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
                name: text.sites.southernSovereign,
                status: text.mainSite,
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
                        name: text.appInstance(1),
                        caption: text.instanceAliasOne,
                        id: 'USFO_03',
                        type: 'APP',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(2),
                        id: 'USFO_04',
                        type: 'APP',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(3),
                        caption: text.instanceAliasThree,
                        id: 'USFO_05',
                        type: 'APP',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(4),
                        caption: text.instanceAliasFour,
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
                name: text.sites.volga,
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
                name: text.sites.urals,
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
                        name: text.appInstance(1),
                        caption: text.instanceAliasOne,
                        id: 'UFO_03',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(2),
                        id: 'UFO_04',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(3),
                        caption: text.instanceAliasThree,
                        id: 'UFO_05',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(4),
                        caption: text.instanceAliasFour,
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
            },
            {
                name: text.sites.siberia,
                id: '07',
                apps: [
                    {
                        name: 'Byte Sentinel',
                        caption: 'Byte 001',
                        id: 'SFO_01',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'CryptoWall',
                        id: 'SFO_02',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'Phantom Gate',
                        id: 'SFO_03',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'SentraLock',
                        caption: 'Lock-sentral-urals',
                        id: 'SFO_04',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'Zero Trace',
                        id: 'SFO_05',
                        type: '',
                        icon: this.SVGIcon
                    }
                ]
            },
            {
                name: text.sites.farEast,
                id: '08',
                apps: [
                    {
                        name: 'Byte Sentinel',
                        caption: 'Byte 001',
                        id: 'DFO_01',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'CryptoWall',
                        id: 'DFO_02',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(1),
                        caption: text.instanceAliasOne,
                        id: 'DFO_03',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(2),
                        id: 'DFO_04',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(3),
                        caption: text.instanceAliasThree,
                        id: 'DFO_05',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(4),
                        caption: text.instanceAliasFour,
                        id: 'DFO_06',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'Phantom Gate',
                        id: 'DFO_07',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'SentraLock',
                        caption: 'Lock-sentral-urals',
                        id: 'DFO_08',
                        type: '',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'Zero Trace',
                        id: 'DFO_09',
                        type: '',
                        icon: this.SVGIcon
                    }
                ]
            }
        ];
    });

    // A locale switch rebuilds `sites`: the selection is carried over to the new objects by id. Apps are
    // looked up in their own site, since two sites may reuse an app id.
    protected readonly selectedSite = linkedSignal<KbqAppSwitcherSite[], KbqAppSwitcherSite | undefined>({
        source: this.sites,
        computation: (sites, previous) => sites.find(({ id }) => id === previous?.value?.id) ?? sites[0]
    });

    protected readonly selectedApp = linkedSignal<KbqAppSwitcherSite | undefined, KbqAppSwitcherApp | undefined>({
        source: this.selectedSite,
        computation: (site, previous) => site?.apps.find(({ id }) => id === previous?.value?.id) ?? site?.apps[0]
    });
}
