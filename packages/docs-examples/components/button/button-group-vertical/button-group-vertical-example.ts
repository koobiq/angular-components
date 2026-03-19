import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButton, KbqButtonCssStyler, KbqButtonGroup, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Button group vertical
 */
@Component({
    selector: 'button-group-vertical-example',
    imports: [
        KbqButton,
        KbqButtonCssStyler,
        KbqButtonGroup,
        KbqIcon
    ],
    template: `
        @for (style of buttonStyles; track style) {
            <div class="layout-row layout-gap-xl">
                <div kbq-button-group [orientation]="'vertical'" [class.layout-gap-3xs]="!!style.gap">
                    <button kbq-button aria-label="Plus" [color]="style.color" [kbqStyle]="style.appearance">
                        <i kbq-icon="kbq-plus_16"></i>
                    </button>
                    <button kbq-button aria-label="Minus" [color]="style.color" [kbqStyle]="style.appearance">
                        <i kbq-icon="kbq-minus_16"></i>
                    </button>
                </div>
            </div>
        }
    `,
    host: {
        class: 'layout-row layout-align-center-center layout-gap-xl'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonGroupVerticalExample {
    protected readonly buttonStyles: { color: KbqComponentColors; appearance: KbqButtonStyles; gap?: boolean }[] = [
        { color: KbqComponentColors.Contrast, appearance: KbqButtonStyles.Filled, gap: true },
        { color: KbqComponentColors.ContrastFade, appearance: KbqButtonStyles.Filled, gap: true },
        { color: KbqComponentColors.ThemeFade, appearance: KbqButtonStyles.Outline },
        { color: KbqComponentColors.ContrastFade, appearance: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, appearance: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, appearance: KbqButtonStyles.Transparent }
    ];
}
