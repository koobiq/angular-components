import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

/**
 * @title Dropdown item progress
 */
@Component({
    selector: 'dropdown-item-progress-example',
    imports: [KbqDropdownModule, KbqButtonModule, KbqIconModule, KbqProgressSpinnerModule],
    template: `
        <button kbq-button [kbqDropdownTriggerFor]="appDropdown">
            Trigger
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #appDropdown="kbqDropdown">
            <button kbq-dropdown-item>Menu item 1</button>
            <button kbq-dropdown-item>Menu item 2</button>
            <button kbq-dropdown-item>Menu item 3</button>
            <button kbq-dropdown-item progress [kbqDropdownTriggerFor]="loadingSubmenu">Menu item 4</button>
            <button kbq-dropdown-item>Menu item 5</button>
            <button kbq-dropdown-item>Menu item 6</button>
            <button kbq-dropdown-item progress disabled>Menu item 7</button>
            <button kbq-dropdown-item>Menu item 8</button>
        </kbq-dropdown>

        <kbq-dropdown #loadingSubmenu="kbqDropdown">
            <div class="layout-row layout-align-center-center" [style.height.px]="100">
                <kbq-progress-spinner mode="indeterminate" />
            </div>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center',
        '[style.height.px]': '200'
    }
})
export class DropdownItemProgressExample {}
