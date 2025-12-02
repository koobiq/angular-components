import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title split-button-text-overflow
 */
@Component({
    selector: 'split-button-text-overflow-example',
    imports: [
        KbqSplitButtonModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqTitleModule
    ],
    template: `
        <kbq-split-button>
            <button kbq-button>
                <i kbq-icon="kbq-plus_16"></i>
                <span kbq-title class="kbq-truncate-line">
                    Save engineering time with unified payments functionality. We obsess over the maze of gateways,
                    payments rails, and financial institutions that make up the global economic landscape so that your
                    teams can build what you need on one platform.
                </span>
            </button>
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
export class SplitButtonTextOverflowExample {}
