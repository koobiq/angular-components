import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';

/**
 * @title split-button-content
 */
@Component({
    selector: 'split-button-content-example',
    imports: [
        KbqSplitButtonModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule
    ],
    template: `
        <kbq-split-button>
            <button kbq-button>
                <i kbq-icon="kbq-plus_16"></i>
                Split Button
            </button>
            <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>

        <kbq-split-button>
            <button kbq-button>Split Button</button>
            <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>

        <kbq-split-button>
            <button kbq-button>
                <i kbq-icon="kbq-plus_16"></i>
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

            gap: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitButtonContentExample {}
