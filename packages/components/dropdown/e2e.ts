import { Directionality } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, Component, EventEmitter } from '@angular/core';
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

@Component({
    selector: 'e2e-dropdown-nested-ltr',
    imports: [KbqDropdownModule],
    template: `
        <div data-testid="dropdown_nested_ltr_default">
            <button
                id="dropdown_nested_ltr_default-trigger"
                style="position: fixed; left: 50px; top: 50px;"
                [kbqDropdownTriggerFor]="defaultRoot"
            >
                Toggle
            </button>
            <kbq-dropdown #defaultRoot="kbqDropdown">
                <button
                    id="dropdown_nested_ltr_default-level-one"
                    kbq-dropdown-item
                    [kbqDropdownTriggerFor]="defaultLevelOne"
                >
                    One
                </button>
                <button kbq-dropdown-item>Two</button>
            </kbq-dropdown>
            <kbq-dropdown #defaultLevelOne="kbqDropdown">
                <button kbq-dropdown-item>Four</button>
                <button kbq-dropdown-item>Five</button>
                <button kbq-dropdown-item>Six</button>
            </kbq-dropdown>
        </div>

        <div data-testid="dropdown_nested_ltr_fallback">
            <button
                id="dropdown_nested_ltr_fallback-trigger"
                style="position: fixed; right: 10px; top: 50%;"
                [kbqDropdownTriggerFor]="fallbackRoot"
            >
                Toggle
            </button>
            <kbq-dropdown #fallbackRoot="kbqDropdown">
                <button
                    id="dropdown_nested_ltr_fallback-level-one"
                    kbq-dropdown-item
                    [kbqDropdownTriggerFor]="fallbackLevelOne"
                >
                    One
                </button>
                <button kbq-dropdown-item>Two</button>
            </kbq-dropdown>
            <kbq-dropdown #fallbackLevelOne="kbqDropdown">
                <button kbq-dropdown-item>Four</button>
                <button kbq-dropdown-item>Five</button>
                <button kbq-dropdown-item>Six</button>
            </kbq-dropdown>
        </div>
    `,
    styles: `
        :host {
            display: block;
            position: relative;
            width: 100%;
            height: 720px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDropdownNestedLtr'
    }
})
export class E2eDropdownNestedLtr {}

@Component({
    selector: 'e2e-dropdown-nested-rtl',
    imports: [KbqDropdownModule],
    providers: [{ provide: Directionality, useValue: { value: 'rtl', change: new EventEmitter() } }],
    template: `
        <div data-testid="dropdown_nested_rtl_default">
            <button
                id="dropdown_nested_rtl_default-trigger"
                style="position: fixed; left: 50%; top: 50%;"
                [kbqDropdownTriggerFor]="defaultRoot"
            >
                Toggle
            </button>
            <kbq-dropdown #defaultRoot="kbqDropdown">
                <button
                    id="dropdown_nested_rtl_default-level-one"
                    kbq-dropdown-item
                    [kbqDropdownTriggerFor]="defaultLevelOne"
                >
                    One
                </button>
                <button kbq-dropdown-item>Two</button>
            </kbq-dropdown>
            <kbq-dropdown #defaultLevelOne="kbqDropdown">
                <button kbq-dropdown-item>Four</button>
                <button kbq-dropdown-item>Five</button>
                <button kbq-dropdown-item>Six</button>
            </kbq-dropdown>
        </div>

        <div data-testid="dropdown_nested_rtl_fallback">
            <button
                id="dropdown_nested_rtl_fallback-trigger"
                style="position: fixed; left: 10px; top: 50%;"
                [kbqDropdownTriggerFor]="fallbackRoot"
            >
                Toggle
            </button>
            <kbq-dropdown #fallbackRoot="kbqDropdown">
                <button
                    id="dropdown_nested_rtl_fallback-level-one"
                    kbq-dropdown-item
                    [kbqDropdownTriggerFor]="fallbackLevelOne"
                >
                    One
                </button>
                <button kbq-dropdown-item>Two</button>
            </kbq-dropdown>
            <kbq-dropdown #fallbackLevelOne="kbqDropdown">
                <button kbq-dropdown-item>Four</button>
                <button kbq-dropdown-item>Five</button>
                <button kbq-dropdown-item>Six</button>
            </kbq-dropdown>
        </div>
    `,
    styles: `
        :host {
            display: block;
            position: relative;
            width: 100%;
            height: 720px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDropdownNestedRtl',
        dir: 'rtl'
    }
})
export class E2eDropdownNestedRtl {}

@Component({
    selector: 'e2e-dropdown-title-overflow',
    imports: [KbqDropdownModule, KbqTitleModule],
    template: `
        <button data-testid="dropdown_title_overflow_trigger" [kbqDropdownTriggerFor]="dropdown">Toggle</button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button
                data-testid="dropdown_title_overflow_plain"
                style="max-width: 150px; width: 150px"
                kbq-dropdown-item
                kbq-title
            >
                {{ longValue }}
            </button>
            <button
                data-testid="dropdown_title_overflow_complex"
                style="max-width: 150px; width: 150px"
                kbq-dropdown-item
                kbq-title
            >
                <div #kbqTitleContainer>
                    <div>Complex header</div>
                    <div #kbqTitleText>{{ longValue }}</div>
                </div>
            </button>
        </kbq-dropdown>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDropdownTitleOverflow'
    }
})
export class E2eDropdownTitleOverflow {
    protected readonly longValue =
        'Just a text and a long text and a long text and a long text and a long text and a long text and a long text';
}
