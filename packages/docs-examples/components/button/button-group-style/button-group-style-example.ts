import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFieldset, KbqFieldsetItem } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Button group style
 */
@Component({
    selector: 'button-group-style-example',
    imports: [
        KbqButtonModule,
        FormsModule,
        KbqFieldset,
        KbqFieldsetItem,
        KbqIcon
    ],
    template: `
        @for (style of buttonStyles; track style) {
            <div class="layout-row layout-gap-xl">
                <kbq-fieldset>
                    @for (item of data; track item) {
                        <button kbq-button kbqFieldsetItem [color]="style.color" [kbqStyle]="style.style">
                            {{ item }}
                        </button>
                    }
                </kbq-fieldset>

                <kbq-fieldset>
                    @for (item of data; track item) {
                        <button kbq-button kbqFieldsetItem [color]="style.color" [kbqStyle]="style.style">
                            <i kbq-icon="kbq-diamond_16"></i>
                        </button>
                    }
                </kbq-fieldset>
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

    protected readonly buttonStyles: { color: KbqComponentColors; style: KbqButtonStyles }[] = [
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ContrastFade, style: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ThemeFade, style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.ContrastFade, style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, style: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent }
    ];
}
