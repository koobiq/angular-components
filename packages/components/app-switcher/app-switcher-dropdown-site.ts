import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KBQ_TITLE_TEXT_REF } from '@koobiq/components/core';
import { KbqDropdownItem } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqAppSwitcherSite } from './app-switcher';

/** @docs-private */
@Component({
    selector: '[kbq-app-switcher-dropdown-site]',
    imports: [
        KbqIcon,
        KbqBadgeModule
    ],
    template: `
        <span class="kbq-app-switcher-dropdown-site__name">{{ site.name }}</span>

        @if (site.status) {
            <kbq-badge class="kbq-app-switcher-dropdown-site__badge" [compact]="true">{{ site.status }}</kbq-badge>
        }

        @if (isNested) {
            <i
                kbq-icon="kbq-chevron-right-s_16"
                class="kbq-app-switcher-dropdown-item-trigger__icon"
                [color]="componentColors.ContrastFade"
            ></i>
        }
    `,
    styleUrls: ['app-switcher-dropdown-site.scss'],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqAppSwitcherDropdownSite },
        { provide: KbqDropdownItem, useExisting: KbqAppSwitcherDropdownSite }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-app-switcher-dropdown-site',
        '[class.kbq-dropdown-item]': 'false'
    },
    exportAs: 'kbqAppSwitcherDropdownSite'
})
export class KbqAppSwitcherDropdownSite extends KbqDropdownItem {
    // TODO: Skipped for migration because:
    //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
    //  and migrating would break narrowing currently.
    @Input('kbq-app-switcher-dropdown-site') site: KbqAppSwitcherSite;
}
