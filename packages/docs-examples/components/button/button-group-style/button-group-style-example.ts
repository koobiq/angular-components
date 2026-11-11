import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqButtonColor, KbqButtonModule, KbqButtonStyle, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

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
                    @for (item of data(); track item) {
                        <button kbq-button>
                            {{ item }}
                        </button>
                    }
                </div>

                <div kbq-button-group [color]="style.color" [kbqStyle]="style.appearance">
                    @for (item of data(); track item) {
                        <button kbq-button [attr.aria-label]="text().diamondIcon">
                            <i kbq-icon="kbq-diamond_16"></i>
                        </button>
                    }
                </div>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-xl'
    }
})
export class ButtonGroupStyleExample {
    protected readonly text = injectExampleText();

    protected readonly data = computed(() => [this.text().archive, this.text().report, this.text().snooze]);

    protected readonly buttonStyles: { color: KbqButtonColor; appearance: KbqButtonStyle; gap?: boolean }[] = [
        { color: KbqComponentColors.Contrast, appearance: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ContrastFade, appearance: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ThemeFade, appearance: KbqButtonStyles.Outline },
        { color: KbqComponentColors.ContrastFade, appearance: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, appearance: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, appearance: KbqButtonStyles.Transparent }
    ];
}
