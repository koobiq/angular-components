import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleDirective } from '@koobiq/components/title';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Dropdown item with a secondary action
 */
@Component({
    selector: 'dropdown-item-action-example',
    imports: [KbqDropdownModule, KbqButtonModule, KbqIconModule, KbqTitleDirective],
    template: `
        <button kbq-button type="button" [kbqDropdownTriggerFor]="checkDropdown">
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
                    color="contrast-fade"
                    [attr.aria-label]="t().rulesSettings"
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
                    color="contrast-fade"
                    [attr.aria-label]="t().hashSumSettings"
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
                    color="contrast-fade"
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
                    color="contrast-fade"
                    [attr.aria-label]="t().moreActions"
                ></a>
            </div>

            <kbq-dropdown #appDropdownNested="kbqDropdown">
                <button kbq-dropdown-item type="button">Edit</button>
                <button kbq-dropdown-item type="button">Delete</button>
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
    protected readonly t = injectTranslation(TRANSLATIONS);
}
