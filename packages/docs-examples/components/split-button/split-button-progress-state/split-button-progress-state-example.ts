import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';

/**
 * @title split-button-progress-state
 */
@Component({
    standalone: true,
    selector: 'split-button-progress-state-example',
    imports: [
        KbqSplitButtonModule,
        KbqButtonModule,
        KbqIcon,
        KbqDropdownModule
    ],
    template: `
        <div>
            <div class="example-split-button-styles__header">Primary in Progress</div>
            <kbq-split-button>
                <button kbq-button [class.kbq-progress]="true">
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">Secondary in Progress</div>
            <kbq-split-button>
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [class.kbq-progress]="true" [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">Completely in Progress</div>
            <kbq-split-button>
                <button kbq-button [class.kbq-progress]="true">
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown" [class.kbq-progress]="true">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

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

        .example-split-button-styles__header {
            margin-bottom: var(--kbq-size-xs);

            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitButtonProgressStateExample {}
