import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Button group style
 */
@Component({
    selector: 'button-group-style-example',
    imports: [
        KbqButtonModule,
        KbqIcon
    ],
    template: `
        @for (style of buttonStyles; track style) {
            <div class="layout-row layout-gap-xl">
                <div kbq-button-group [color]="style.color" [kbqStyle]="style.appearance">
                    @for (item of data; track item) {
                        <button kbq-button>
                            {{ item }}
                        </button>
                    }
                </div>

                <div kbq-button-group [color]="style.color" [kbqStyle]="style.appearance">
                    @for (item of data; track item) {
                        <button kbq-button aria-label="Diamond icon">
                            <i kbq-icon="kbq-diamond_16"></i>
                        </button>
                    }
                </div>
            </div>
        }
    `,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-xl'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonGroupStyleExample {
    protected readonly data = [
        'Archive',
        'Report',
        'Snooze'
    ] as const;

    protected readonly buttonStyles: { color: KbqComponentColors; appearance: KbqButtonStyles; gap?: boolean }[] = [
        { color: KbqComponentColors.Contrast, appearance: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ContrastFade, appearance: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ThemeFade, appearance: KbqButtonStyles.Outline },
        { color: KbqComponentColors.ContrastFade, appearance: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, appearance: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, appearance: KbqButtonStyles.Transparent }
    ];
}
