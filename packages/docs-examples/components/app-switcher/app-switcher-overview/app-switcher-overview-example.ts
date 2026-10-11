import { ChangeDetectionStrategy, Component, computed, linkedSignal } from '@angular/core';
import { KbqAppSwitcherApp, KbqAppSwitcherModule, KbqAppSwitcherSite } from '@koobiq/components/app-switcher';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from '../localized-data';

/**
 * @title app-switcher
 */
@Component({
    selector: 'app-switcher-overview-example',
    imports: [
        KbqAppSwitcherModule,
        KbqButtonModule,
        KbqIcon,
        KbqToolTipModule
    ],
    template: `
        {{ text().app }} {{ selectedApp()?.name }}
        <br />
        <br />
        <button
            kbq-button
            kbqAppSwitcher
            [attr.aria-label]="text().allApps"
            [kbqTooltip]="text().allApps"
            [sites]="sites()"
            [(selectedApp)]="selectedApp"
        >
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSwitcherOverviewExample {
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
                        iconSrc: 'https://koobiq.io/assets/images/favicons/icon.svg'
                    },
                    {
                        name: 'CryptoWall',
                        id: 'SZFO_02',
                        iconSrc: 'https://koobiq.io/assets/images/favicons/icon.svg'
                    },
                    {
                        name: text.appInstance(1),
                        caption: text.instanceAliasOne,
                        id: 'SZFO_03',
                        iconSrc: 'https://koobiq.io/assets/images/favicons/icon.svg'
                    },
                    {
                        name: text.appInstance(2),
                        id: 'SZFO_04',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(3),
                        caption: text.instanceAliasThree,
                        id: 'SZFO_05',
                        icon: this.SVGIcon
                    },
                    {
                        name: text.appInstance(4),
                        caption: text.instanceAliasFour,
                        id: 'SZFO_06',
                        icon: this.SVGIcon
                    },
                    {
                        name: 'Phantom Gate',
                        id: 'SZFO_07',
                        icon: this.SVGIcon
                    }
                ]
            }
        ];
    });

    // A locale switch rebuilds `sites`: the selection is carried over to the new objects by id.
    protected readonly selectedApp = linkedSignal<KbqAppSwitcherSite[], KbqAppSwitcherApp | undefined>({
        source: this.sites,
        computation: ([site], previous) => site.apps.find(({ id }) => id === previous?.value?.id) ?? site.apps[1]
    });
}
