import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFieldset, KbqFieldsetItem } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Button group content
 */
@Component({
    selector: 'button-group-content-example',
    imports: [
        KbqButtonModule,
        FormsModule,
        KbqFieldset,
        KbqFieldsetItem,
        KbqIcon
    ],
    template: `
        <kbq-fieldset>
            @for (item of data; track item) {
                <button kbq-button kbqFieldsetItem [color]="color" [kbqStyle]="style">
                    <i kbq-icon="kbq-diamond_16"></i>
                    {{ item }}
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            }
        </kbq-fieldset>

        <kbq-fieldset>
            @for (item of data; track item) {
                <button kbq-button kbqFieldsetItem [color]="color" [kbqStyle]="style">
                    <i kbq-icon="kbq-diamond_16"></i>
                    {{ item }}
                </button>
            }
        </kbq-fieldset>

        <kbq-fieldset>
            @for (item of data; track item) {
                <button kbq-button kbqFieldsetItem [color]="color" [kbqStyle]="style">
                    {{ item }}
                </button>
            }
        </kbq-fieldset>

        <kbq-fieldset>
            @for (item of data; track item) {
                <button kbq-button kbqFieldsetItem [color]="color" [kbqStyle]="style">
                    <i kbq-icon="kbq-diamond_16"></i>
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            }
        </kbq-fieldset>

        <kbq-fieldset>
            @for (item of data; track item) {
                <button kbq-button kbqFieldsetItem [color]="color" [kbqStyle]="style">
                    <i kbq-icon="kbq-diamond_16"></i>
                </button>
            }
        </kbq-fieldset>
    `,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonGroupContentExample {
    protected readonly data = [
        'Archive',
        'Report',
        'Snooze'
    ] as const;

    protected readonly color = KbqComponentColors.ContrastFade;
    protected readonly style = KbqButtonStyles.Filled;
}
