import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip width
 */
@Component({
    selector: 'tooltip-width-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-row" style="gap: var(--kbq-size-l); justify-content: center">
            <button kbq-button kbqTooltip="Tooltip">Tooltip</button>
            <button
                kbq-button
                kbqTooltip="A tooltip is a hint that appears when the pointer hovers over or focuses on an interface element. A tooltip cannot contain interactive elements."
            >
                Max Width
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipWidthExample {
    placement: PopUpPlacements = PopUpPlacements.Top;
}
