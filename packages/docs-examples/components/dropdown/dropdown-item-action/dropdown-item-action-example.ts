import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleDirective } from '@koobiq/components/title';
import { injectExampleText } from '../l10n';

/**
 * @title Dropdown item with a secondary action
 */
@Component({
    selector: 'dropdown-item-action-example',
    imports: [KbqDropdownModule, KbqButtonModule, KbqIconModule, KbqTitleDirective],
    template: `
        <button kbq-button [kbqDropdownTriggerFor]="checkDropdown">
            Check
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #checkDropdown="kbqDropdown">
            <div kbq-dropdown-item kbq-title>
                Check with rules
                <a
                    kbq-icon-button="kbq-gear_16"
                    kbqDropdownItemAction
                    size="compact"
                    target="_blank"
                    href="en/components/button"
                    [attr.aria-label]="text().rulesSettings"
                    [color]="'contrast-fade'"
                ></a>
            </div>

            <div kbq-dropdown-item>
                Check by hash sum
                <a
                    kbq-icon-button="kbq-gear_16"
                    kbqDropdownItemAction
                    size="compact"
                    target="_blank"
                    href="en/components/icon"
                    [attr.aria-label]="text().hashSumSettings"
                    [color]="'contrast-fade'"
                ></a>
            </div>

            <div kbq-dropdown-item disabled>
                Not available
                <a
                    kbq-icon-button="kbq-gear_16"
                    kbqDropdownItemAction
                    size="compact"
                    aria-label="Hash sum settings (unavailable)"
                    target="_blank"
                    href="en/components/icon"
                    [color]="'contrast-fade'"
                    [disabled]="true"
                ></a>
            </div>

            <div kbq-dropdown-item [kbqDropdownTriggerFor]="appDropdownNested">
                Nested
                <a
                    kbq-icon-button="kbq-gear_16"
                    kbqDropdownItemAction
                    size="compact"
                    target="_blank"
                    href="en/components/tag"
                    [attr.aria-label]="text().moreActions"
                    [color]="'contrast-fade'"
                ></a>
            </div>

            <kbq-dropdown #appDropdownNested="kbqDropdown">
                <button kbq-dropdown-item>Edit</button>
                <button kbq-dropdown-item>Delete</button>
            </kbq-dropdown>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center',
        '[style.height.px]': '200'
    }
})
export class DropdownItemActionExample {
    protected readonly text = injectExampleText();
}
