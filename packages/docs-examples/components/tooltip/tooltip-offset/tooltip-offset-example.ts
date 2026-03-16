import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip offset
 */
@Component({
    selector: 'tooltip-offset-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <div class="layout-row layout-align-center-center" style="min-height: 120px; gap: var(--kbq-size-l);">
            <button kbq-button kbqTooltip="Tooltip">Default</button>
            <button kbq-button kbqTooltip="Tooltip" [kbqTooltipArrow]="true">Default with arrow</button>
            <button kbq-button kbqTooltip="Tooltip" [kbqTooltipOffset]="0">0px</button>
            <button kbq-button kbqTooltip="Tooltip" [kbqTooltipOffset]="32">32px</button>
            <button kbq-button kbqTooltip="Tooltip" [kbqTooltipOffset]="-8">-8px</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipOffsetExample {}
