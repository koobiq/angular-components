import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button group overview
 */
@Component({
    selector: 'button-group-overview-example',
    imports: [KbqButtonModule],
    template: `
        <div class="layout-gap-3xs" kbq-button-group>
            @for (item of data; track item) {
                <button kbq-button [kbqStyle]="style" [color]="color">
                    {{ item }}
                </button>
            }
        </div>
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
