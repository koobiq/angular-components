import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Button group content
 */
@Component({
    selector: 'button-group-content-example',
    imports: [
        KbqButtonModule,
        KbqIcon
    ],
    template: `
        <div kbq-button-group class="layout-gap-3xs">
            @for (item of data; track item) {
                <button kbq-button [color]="color" [kbqStyle]="style">
                    <i kbq-icon="kbq-diamond_16"></i>
                    {{ item }}
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            }
        </div>

        <div kbq-button-group class="layout-gap-3xs">
            @for (item of data; track item) {
                <button kbq-button [color]="color" [kbqStyle]="style">
                    <i kbq-icon="kbq-diamond_16"></i>
                    {{ item }}
                </button>
            }
        </div>

        <div kbq-button-group class="layout-gap-3xs">
            @for (item of data; track item) {
                <button kbq-button [color]="color" [kbqStyle]="style">
                    {{ item }}
                </button>
            }
        </div>

        <div kbq-button-group class="layout-gap-3xs">
            @for (item of data; track item) {
                <button kbq-button [color]="color" [kbqStyle]="style">
                    <i kbq-icon="kbq-diamond_16"></i>
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            }
        </div>

        <div kbq-button-group class="layout-gap-3xs">
            @for (item of data; track item) {
                <button kbq-button [color]="color" [kbqStyle]="style">
                    <i kbq-icon="kbq-diamond_16"></i>
                </button>
            }
        </div>
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
