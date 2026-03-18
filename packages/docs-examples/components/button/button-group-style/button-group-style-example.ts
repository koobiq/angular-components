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
                <div
                    class="kbq-group"
                    [class.layout-gap-3xs]="
                        (style.color === 'contrast' || style.color === 'contrast-fade') && style.style === 'filled'
                    "
                >
                    @for (item of data; track item) {
                        <button kbq-button class="kbq-group-item" [color]="style.color" [kbqStyle]="style.style">
                            {{ item }}
                        </button>
                    }
                </div>

                <div
                    class="kbq-group"
                    [class.layout-gap-3xs]="
                        (style.color === 'contrast' || style.color === 'contrast-fade') && style.style === 'filled'
                    "
                >
                    @for (item of data; track item) {
                        <button kbq-button class="kbq-group-item" [color]="style.color" [kbqStyle]="style.style">
                            <i kbq-icon="kbq-diamond_16"></i>
                        </button>
                    }
                </div>
            </div>
        }
    `,
    styles: `
        .dev-button-group:is(.kbq-button, .kbq-button-icon).kbq-button_filled {
            position: relative;
            /*z-index: unset !important;*/

            /*border-right: 0;*/
            margin-left: 0 !important;

            &:first-child:not(:last-child) {
                /*border-right: 0;*/
            }

            &:not(:first-child):not(:last-child) {
                /*border-left: 0;*/
                /*border-right: 0;*/
            }

            &:last-child:not(:first-child) {
                /*border-left: 0;*/
            }

            &:not(:first-child):not(:last-child) {
                &::before {
                    display: block;
                    /*content: '';*/
                    height: 100%;
                    width: var(--kbq-size-border-width);
                    position: absolute;
                    left: -1px;
                    top: 0;
                    background-color: var(--splitter-color);
                }

                &::after {
                    display: block;
                    /*content: '';*/
                    height: 100%;
                    width: var(--kbq-size-border-width);
                    position: absolute;
                    right: -1px;
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
