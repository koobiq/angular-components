import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFieldset, KbqFieldsetItem } from '@koobiq/components/form-field';

/**
 * @title Button group overview
 */
@Component({
    selector: 'button-group-overview-example',
    imports: [
        KbqButtonModule,
        FormsModule,
        KbqFieldset,
        KbqFieldsetItem
    ],
    template: `
        <kbq-fieldset>
            @for (item of data; track item) {
                <button kbq-button kbqFieldsetItem [kbqStyle]="style" [color]="color">
                    {{ item }}
                </button>
            }
        </kbq-fieldset>
    `,
    styles: `
        .kbq-fieldset-item.kbq-button.kbq-contrast-fade {
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
                    background-color: var(--kbq-line-contrast-fade);
                }
            }
        }
    `,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-xl'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonGroupOverviewExample {
    protected readonly data = [
        'Archive',
        'Report',
        'Snooze'
    ] as const;

    protected readonly color = KbqComponentColors.ContrastFade;
    protected readonly style = KbqButtonStyles.Filled;
}
