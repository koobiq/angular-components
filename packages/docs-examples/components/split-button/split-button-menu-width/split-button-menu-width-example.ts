import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { injectExampleText } from '../l10n';

/**
 * @title split-button-menu-width
 */
@Component({
    selector: 'split-button-menu-width-example',
    imports: [
        KbqSplitButtonModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule
    ],
    template: `
        <kbq-split-button [panelAutoWidth]="true">
            <button kbq-button>{{ text().splitButton }}</button>
            <button kbq-button [attr.aria-label]="text().moreOptions" [kbqDropdownTriggerFor]="dropdown">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>

        <kbq-dropdown #dropdown="kbqDropdown" [panelWidth]="'auto'" [panelMinWidth]="0">
            <button kbq-dropdown-item>{{ text().extraAction(1) }}</button>
            <button kbq-dropdown-item>{{ text().extraAction(2) }}</button>
            <button kbq-dropdown-item>{{ text().extraAction(3) }}</button>
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
export class SplitButtonMenuWidthExample {
    protected readonly text = injectExampleText();
}
