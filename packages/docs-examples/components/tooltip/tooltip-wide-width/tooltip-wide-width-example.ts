import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip wide width
 */
@Component({
    selector: 'tooltip-wide-width-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-row" style="gap: var(--kbq-size-l); justify-content: center">
            <button kbq-button kbqTooltip="9f1c2e4a8b7d3f6c5e2a1d9b0c4e7f8a6d3c2b1a9e8f7d6c5b4a3e2d1c0f9a8">
                9f1c...f9a8
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipWideWidthExample {
    placement: PopUpPlacements = PopUpPlacements.Top;
}
