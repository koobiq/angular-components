import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFieldset, KbqFieldsetItem } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Button group custom content
 */
@Component({
    selector: 'button-group-custom-content-example',
    imports: [
        KbqButtonModule,
        FormsModule,
        KbqFieldset,
        KbqFieldsetItem,
        KbqIcon
    ],
    template: `
        <kbq-fieldset>
            <button kbq-button kbqFieldsetItem [kbqStyle]="style" [color]="color">
                <i kbq-icon="kbq-diamond_16"></i>
                {{ data[0] }}
            </button>

            <button kbq-button kbqFieldsetItem [kbqStyle]="style" [color]="color">
                {{ data[1] }}
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            <button kbq-button kbqFieldsetItem [kbqStyle]="style" [color]="color">
                {{ data[2] }}
            </button>

            <button kbq-button kbqFieldsetItem [kbqStyle]="style" [color]="color">
                <i kbq-icon="kbq-ellipsis-vertical_16"></i>
            </button>
        </kbq-fieldset>
    `,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonGroupCustomContentExample {
    protected readonly data = [
        'Archive',
        'Report',
        'Snooze'
    ] as const;

    protected readonly color = KbqComponentColors.ContrastFade;
    protected readonly style = KbqButtonStyles.Filled;
}
