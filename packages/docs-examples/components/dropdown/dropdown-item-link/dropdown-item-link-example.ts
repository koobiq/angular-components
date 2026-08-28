import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Dropdown item as a link
 */
@Component({
    selector: 'dropdown-item-link-example',
    imports: [KbqDropdownModule, KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button [kbqDropdownTriggerFor]="actionsDropdown">
            Actions
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #actionsDropdown="kbqDropdown">
            <a kbq-dropdown-item href="https://angular.dev/" target="_blank" rel="noopener noreferrer">Angular</a>
            <a kbq-dropdown-item href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
                TypeScript
            </a>
            <a kbq-dropdown-item href="https://storybook.js.org/" target="_blank" rel="noopener noreferrer">
                Storybook
            </a>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center',
        '[style.height.px]': '200'
    }
})
export class DropdownItemLinkExample {}
