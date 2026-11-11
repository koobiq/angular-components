import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { KbqTitleModule } from '@koobiq/components/title';
import { injectExampleText } from './l10n';

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
                    {{ text().saveEngineering }}
                </span>
            </button>
            <button kbq-button [attr.aria-label]="text().moreOptions" [kbqDropdownTriggerFor]="dropdown">
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
export class SplitButtonTextOverflowExample {
    protected readonly text = injectExampleText();
}
