import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqDropdownModule } from './dropdown.module';

@Component({
    selector: 'e2e-dropdown-states',
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDividerModule,
        KbqTitleModule,
        KbqOptionModule
    ],
    template: `
        <button kbq-button data-testid="e2eDropdownTrigger" [kbqDropdownTriggerFor]="dropdown">
            Dropdown
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Item</button>

            <button kbq-dropdown-item>
                <i kbq-icon="kbq-bug_16" [color]="'contrast'"></i>
                Item with icon
            </button>

            <button kbq-dropdown-item data-testid="e2eSubmenuTrigger" [kbqDropdownTriggerFor]="submenu">
                Item with caption
                <div class="kbq-dropdown-item__caption">Caption</div>
            </button>

            <button kbq-dropdown-item>
                <i kbq-icon="kbq-bug_16" [color]="'contrast'"></i>
                Item with icon and caption
                <div class="kbq-dropdown-item__caption">Caption</div>
            </button>

            <button kbq-dropdown-item kbq-title>
                Item with kbq-title. In cryptography, a brute-force attack consists of an attacker submitting many
                passwords or passphrases with the hope of eventually guessing correctly. The attacker systematically
                checks all possible passwords and passphrases until the correct one is found.
            </button>

            <kbq-divider />

            <div class="kbq-dropdown__group-header">Group header</div>

            <button kbq-dropdown-item>Item after header</button>

            <kbq-divider />

            <kbq-optgroup label="Subheading" />

            <button kbq-dropdown-item>Item after subheading</button>

            <kbq-divider />

            <button disabled kbq-dropdown-item>Disabled item</button>

            <button disabled kbq-dropdown-item>
                <i kbq-icon="kbq-bug_16" [color]="'contrast'"></i>
                Disabled with icon
            </button>
        </kbq-dropdown>

        <kbq-dropdown #submenu="kbqDropdown">
            <button kbq-dropdown-item>Submenu item</button>
            <button kbq-dropdown-item>
                Item with caption
                <div class="kbq-dropdown-item__caption">Caption</div>
            </button>
            <kbq-divider />
            <kbq-optgroup label="Subheading" />
            <button kbq-dropdown-item data-testid="e2eSubmenu2Trigger" [kbqDropdownTriggerFor]="submenu2">
                <i kbq-icon="kbq-bug_16" [color]="'contrast'"></i>
                Item with icon
            </button>
            <button kbq-dropdown-item disabled>
                Disabled item
                <div class="kbq-dropdown-item__caption">Caption</div>
            </button>
        </kbq-dropdown>

        <kbq-dropdown #submenu2="kbqDropdown">
            <div class="kbq-dropdown__group-header">Group header</div>
            <button kbq-dropdown-item disabled>Item disabled</button>
            <button kbq-dropdown-item data-testid="e2eSubmenu2ItemWithIcon">
                <i kbq-icon="kbq-bug_16" [color]="'contrast'"></i>
                Item with icon
            </button>
            <kbq-divider />
            <button kbq-dropdown-item>Item</button>
        </kbq-dropdown>
    `,
    styles: `
        :host {
            display: flex;
            height: 500px;
            width: 950px;
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDropdownStates'
    }
})
export class E2eDropdownStates {}
