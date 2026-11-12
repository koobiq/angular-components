import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title split-button-disabled-state
 */
@Component({
    selector: 'split-button-disabled-state-example',
    imports: [
        KbqSplitButtonModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule
    ],
    template: `
        <div>
            <div class="example-split-button-styles__header">{{ t().primaryDisabled }}</div>
            <kbq-split-button>
                <button kbq-button [disabled]="true">
                    <i kbq-icon="kbq-plus_16"></i>
                    {{ t().splitButton }}
                </button>
                <button kbq-button [attr.aria-label]="t().moreOptions" [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">{{ t().secondaryDisabled }}</div>
            <kbq-split-button>
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    {{ t().splitButton }}
                </button>
                <button
                    kbq-button
                    [attr.aria-label]="t().moreOptions"
                    [disabled]="true"
                    [kbqDropdownTriggerFor]="dropdown"
                >
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">{{ t().completelyDisabled }}</div>
            <kbq-split-button [disabled]="true">
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    {{ t().splitButton }}
                </button>
                <button kbq-button [attr.aria-label]="t().moreOptions" [kbqDropdownTriggerFor]="dropdown">
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
export class SplitButtonDisabledStateExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
