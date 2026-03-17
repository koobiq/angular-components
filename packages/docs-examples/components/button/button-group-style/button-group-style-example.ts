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
    styles: `
        .kbq-fieldset-item:is(.kbq-button, .kbq-button-icon).kbq-button_filled {
            position: relative;

            /*border-right: 0;*/
            margin-left: 0;

            &:not(:last-child) {
                &::after {
                    display: block;
                    content: '';
                    height: 100%;
                    width: var(--kbq-size-border-width);
                    position: absolute;
                    right: 0;
                    top: 0;
                    background-color: var(--splitter-color);
                }
            }

            &.kbq-contrast {
                --splitter-color: var(--kbq-background-contrast-fade);
            }

            &.kbq-contrast-fade {
                --splitter-color: var(--kbq-line-contrast-fade);
            }
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
