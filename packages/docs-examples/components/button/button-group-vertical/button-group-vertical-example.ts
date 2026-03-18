import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Button group vertical
 */
@Component({
    selector: 'button-group-vertical-example',
    imports: [
        KbqButtonModule,
        FormsModule,
        KbqIcon
    ],
    template: `
        @for (style of buttonStyles; track style) {
            <div class="layout-row layout-gap-xl">
                <div
                    class="kbq-vertical-group"
                    [class.layout-gap-3xs]="
                        (style.color === 'contrast' || style.color === 'contrast-fade') && style.style === 'filled'
                    "
                >
                    <button
                        kbq-button
                        class="kbq-group-item"
                        aria-label="Plus"
                        [color]="style.color"
                        [kbqStyle]="style.style"
                    >
                        <i kbq-icon="kbq-plus_16"></i>
                    </button>
                    <button
                        kbq-button
                        class="kbq-group-item"
                        aria-label="Minus"
                        [color]="style.color"
                        [kbqStyle]="style.style"
                    >
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
    protected readonly buttonStyles: { color: KbqComponentColors; style: KbqButtonStyles }[] = [
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ContrastFade, style: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ThemeFade, style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.ContrastFade, style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, style: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent }
    ];
}
