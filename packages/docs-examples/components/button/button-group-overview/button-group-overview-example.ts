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
