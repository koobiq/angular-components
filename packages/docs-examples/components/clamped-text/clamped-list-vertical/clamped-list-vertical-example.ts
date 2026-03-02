import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqClampedList, KbqClampedListItem, KbqClampedListTrigger } from '@koobiq/components/clamped-text';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Clamped-list vertical
 */
@Component({
    selector: 'clamped-list-vertical-example',
    imports: [KbqClampedList, KbqClampedListItem, KbqClampedListTrigger, KbqIcon, KbqLink],
    template: `
        <div class="layout-margin-bottom-l layout-margin-top-l">
            <div #clampedList="kbqClampedList" kbqClampedList [items]="items">
                @for (item of clampedList.visibleItems(); track item.id) {
                    <div class="layout-row layout-align-space-between-center">
                        <a
                            kbq-link
                            style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden"
                            [href]="item.url"
                        >
                            {{ item.name }}
                        </a>
                        <div style="min-width: 45px;">{{ item.id }}</div>
                    </div>
                }
                @if (clampedList.hasToggle()) {
                    <a #trigger="kbqClampedListTrigger" kbqClampedListTrigger kbq-link pseudo>
                        @if (clampedList.collapsedState()) {
                            <i kbq-icon="kbq-chevron-down_16"></i>
                            <span class="kbq-link__text">Show {{ clampedList.exceededItemCount() }} more</span>
                        } @else {
                            <i kbq-icon="kbq-chevron-up_16"></i>
                            <span class="kbq-link__text">
                                {{ clampedList.localeConfiguration()?.closeText ?? 'close' }}
                            </span>
                        }
                    </a>
                }
            </div>
        </div>
    `,
    styles: `
        :host > div {
            overflow: auto;
            resize: horizontal;
            max-width: 100%;
            min-width: 150px;
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedListVerticalExample {
    protected readonly collapsed = signal(true);
    protected items = [
        {
            id: 'T1557',
            name: 'Adversary-in-the-Middle',
            url: 'https://attack.mitre.org/techniques/T1557/'
        },
        {
            id: 'T1110',
            name: 'Brute Force',
            url: 'https://attack.mitre.org/techniques/T1110/'
        },
        {
            id: 'T1555',
            name: 'Credentials from Password Stores',
            url: 'https://attack.mitre.org/techniques/T1555/'
        },
        {
            id: 'T1212',
            name: 'Exploitation for Credential Access',
            url: 'https://attack.mitre.org/techniques/T1212/'
        },
        {
            id: 'T1187',
            name: 'Forced Authentication',
            url: 'https://attack.mitre.org/techniques/T1187/'
        },
        {
            id: 'T1606',
            name: 'Forge Web Credentials',
            url: 'https://attack.mitre.org/techniques/T1606/'
        },
        {
            id: 'T1056',
            name: 'Input Capture',
            url: 'https://attack.mitre.org/techniques/T1056/'
        },
        {
            id: 'T1556',
            name: 'Modify Authentication Process',
            url: 'https://attack.mitre.org/techniques/T1556/'
        },
        {
            id: 'T1111',
            name: 'Multi-Factor Authentication Interception',
            url: 'https://attack.mitre.org/techniques/T1111/'
        },
        {
            id: 'T1621',
            name: 'Multi-Factor Authentication Request Generation',
            url: 'https://attack.mitre.org/techniques/T1621/'
        },
        {
            id: 'T1040',
            name: 'Network Sniffing',
            url: 'https://attack.mitre.org/techniques/T1040/'
        },
        {
            id: 'T1003',
            name: 'OS Credential Dumping',
            url: 'https://attack.mitre.org/techniques/T1003/'
        },
        {
            id: 'T1528',
            name: 'Steal Application Access Token',
            url: 'https://attack.mitre.org/techniques/T1528/'
        },
        {
            id: 'T1649',
            name: 'Steal or Forge Authentication Certificates',
            url: 'https://attack.mitre.org/techniques/T1649/'
        },
        {
            id: 'T1558',
            name: 'Steal or Forge Kerberos Tickets',
            url: 'https://attack.mitre.org/techniques/T1558/'
        },
        {
            id: 'T1539',
            name: 'Steal Web Session Cookie',
            url: 'https://attack.mitre.org/techniques/T1539/'
        },
        {
            id: 'T1552',
            name: 'Unsecured Credentials',
            url: 'https://attack.mitre.org/techniques/T1552/'
        }
    ];
}
