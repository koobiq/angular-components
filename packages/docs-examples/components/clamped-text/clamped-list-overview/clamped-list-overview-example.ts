import { ChangeDetectionStrategy, Component, signal, viewChildren } from '@angular/core';
import { KbqClampedList, KbqClampedListTrigger } from '@koobiq/components/clamped-text';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Clamped-list vertical
 */
@Component({
    selector: 'clamped-list-overview-example',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqIcon, KbqLink],
    template: `
        <!--@TODO update gap with paddings when link underline with text-decoration used (#DS-4778)-->
        <div
            #clampedList="kbqClampedList"
            kbqClampedList
            class="layout-column layout-gap-xxs"
            [items]="items"
            (isCollapsedChange)="focusWhenExpanded($event)"
        >
            @for (item of clampedList.visibleItems(); track item.id) {
                <div class="layout-row layout-align-space-between-start">
                    <a kbq-link target="_blank" [href]="item.url">
                        {{ item.name }}
                    </a>
                    <div style="min-width: 45px;">
                        {{ item.id }}
                    </div>
                </div>
            }
            @if (clampedList.hasToggle()) {
                <a kbq-link kbqClampedListTrigger pseudo>
                    @if (clampedList.isCollapsed()) {
                        <i kbq-icon="kbq-chevron-down_16"></i>
                        <span class="kbq-link__text">{{ clampedList.showMoreCountText() }}</span>
                    } @else {
                        <i kbq-icon="kbq-chevron-up_16"></i>
                        <span class="kbq-link__text">
                            {{ clampedList.localeConfiguration().closeText }}
                        </span>
                    }
                </a>
            }
        </div>
    `,
    styles: `
        .kbq-clamped-list__trigger {
            margin-top: 0;
            display: inline-block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedListOverviewExample {
    protected readonly collapsed = signal(true);
    protected readonly clampedListItems = viewChildren(KbqLink);
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

    protected focusWhenExpanded(isCollapsed: boolean) {
        const isExpanded = !isCollapsed;

        if (isExpanded) {
            const links = this.clampedListItems();

            links.length && links[0].focus();
        }
    }
}
