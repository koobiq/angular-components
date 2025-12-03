import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';

/**
 * @title split-button-styles
 */
@Component({
    selector: 'split-button-styles-example',
    imports: [
        KbqSplitButtonModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule
    ],
    template: `
        <div>
            <div class="example-split-button-styles__header">Filled Contrast</div>
            <kbq-split-button [color]="componentColors.Contrast">
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">Filled Fade Contrast</div>
            <kbq-split-button>
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">Outline Fade Theme</div>
            <kbq-split-button [color]="componentColors.ThemeFade" [kbqStyle]="buttonStyles.Outline">
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">Outline Fade Contrast</div>
            <kbq-split-button [color]="componentColors.ContrastFade" [kbqStyle]="buttonStyles.Outline">
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">Transparent Theme</div>
            <kbq-split-button [color]="componentColors.Theme" [kbqStyle]="buttonStyles.Transparent">
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>
        </div>

        <div>
            <div class="example-split-button-styles__header">Transparent Contrast</div>
            <kbq-split-button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent">
                <button kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    Split Button
                </button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown">
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
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 1fr);

            grid-column-gap: 24px;
            grid-row-gap: 16px;

            margin: auto;
            width: 320px;
        }

        .example-split-button-styles__header {
            margin-bottom: var(--kbq-size-xs);

            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitButtonStylesExample {
    buttonStyles = KbqButtonStyles;
    componentColors = KbqComponentColors;
}
