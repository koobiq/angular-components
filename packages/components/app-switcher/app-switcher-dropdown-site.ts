import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
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
        <span class="kbq-app-switcher-dropdown-site__name">{{ site().name }}</span>

        @if (site().status; as status) {
            <kbq-badge class="kbq-app-switcher-dropdown-site__badge" [compact]="true">{{ status }}</kbq-badge>
        }

        @if (isNested) {
            <i
                kbq-icon="kbq-chevron-right-s_16"
                aria-hidden="true"
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
        role: 'menuitem',
        '[class.kbq-dropdown-item]': 'false',
        '[attr.tabindex]': 'getTabIndex()',
        '[attr.aria-haspopup]': "isNested ? 'menu' : null"
    },
    exportAs: 'kbqAppSwitcherDropdownSite'
})
export class KbqAppSwitcherDropdownSite extends KbqDropdownItem {
    /** Site rendered by this row. */
    readonly site = input.required<KbqAppSwitcherSite>({ alias: 'kbq-app-switcher-dropdown-site' });
}
