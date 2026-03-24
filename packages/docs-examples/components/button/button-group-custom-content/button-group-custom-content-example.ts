import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Button group custom content
 */
@Component({
    selector: 'button-group-custom-content-example',
    imports: [
        KbqButtonModule,
        KbqIcon
    ],
    template: `
        <div kbq-button-group>
            <button kbq-button [kbqStyle]="style" [color]="color">
                <i kbq-icon="kbq-diamond_16"></i>
                {{ data[0] }}
            </button>

            <button kbq-button class="kbq-dropdown-trigger" [kbqStyle]="style" [color]="color">
                {{ data[1] }}
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            <button kbq-button [kbqStyle]="style" [color]="color">
                {{ data[2] }}
            </button>

            <button kbq-button [kbqStyle]="style" [color]="color">
                <i kbq-icon="kbq-ellipsis-vertical_16"></i>
            </button>
        </div>
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
