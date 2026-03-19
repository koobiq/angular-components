import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip width
 */
@Component({
    selector: 'tooltip-width-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button kbq-button kbqTooltip="Tooltip">Tooltip</button>
        <button
            kbq-button
            kbqTooltip="A tooltip is a hint that appears when the pointer hovers over or focuses on an interface element. A tooltip cannot contain interactive elements."
        >
            Max Width
        </button>
    `,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipWidthExample {
    placement: PopUpPlacements = PopUpPlacements.Top;
}
