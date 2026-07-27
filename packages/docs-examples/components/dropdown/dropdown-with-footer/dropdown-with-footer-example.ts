import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Dropdown with footer
 */
@Component({
    selector: 'dropdown-with-footer-example',
    imports: [KbqDropdownModule, KbqButtonModule, KbqLinkModule, KbqIconModule],
    template: `
        <button kbq-button [kbqDropdownTriggerFor]="appDropdown">
            Trigger
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #appDropdown="kbqDropdown">
            <button kbq-dropdown-item>Menu item 1</button>
            <button kbq-dropdown-item>Menu item 2</button>
            <button kbq-dropdown-item>Menu item 3</button>
            <button kbq-dropdown-item [kbqDropdownTriggerFor]="submenu">Menu item 4</button>
            <button kbq-dropdown-item>Menu item 5</button>

            <kbq-dropdown-footer>
                <a
                    class="kbq-link_external"
                    href="https://github.com/koobiq/angular-components"
                    target="_blank"
                    rel="noopener noreferrer"
                    kbq-link
                >
                    <span class="kbq-link__text">GitHub</span>
                    <i kbq-icon="kbq-north-east_16"></i>
                </a>
            </kbq-dropdown-footer>
        </kbq-dropdown>

        <kbq-dropdown #submenu="kbqDropdown">
            <button kbq-dropdown-item>Menu item 1</button>
            <button kbq-dropdown-item>Menu item 2</button>
            <button kbq-dropdown-item>Menu item 3</button>
            <kbq-dropdown-footer class="example-submenu-footer">
                Footer text is multiline and wraps across lines
            </kbq-dropdown-footer>
        </kbq-dropdown>
    `,
    styles: `
        :host {
            height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .example-submenu-footer {
            font-size: var(--kbq-typography-text-compact-font-size);
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownWithFooterExample {}
