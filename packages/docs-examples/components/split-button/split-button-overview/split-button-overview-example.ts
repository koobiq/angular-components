import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';

/**
 * @title split-button
 */
@Component({
    standalone: true,
    selector: 'split-button-overview-example',
    imports: [
        KbqSplitButtonModule,
        KbqButtonModule,
        KbqIcon,
        KbqDropdownModule
    ],
    template: `
        <kbq-split-button>
            <button kbq-button>Split Button</button>
            <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>

        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Extra Action 1</button>
            <button kbq-dropdown-item>Extra Action 2</button>
            <button kbq-dropdown-item>Extra Action 3</button>
        </kbq-dropdown>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 120px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitButtonOverviewExample {}
