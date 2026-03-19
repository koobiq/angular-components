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
        <button kbq-button kbqTooltip="Tooltip">Default</button>
        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipArrow]="true">Default with arrow</button>
        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipOffset]="0">0px</button>
        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipOffset]="32">32px</button>
        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipOffset]="-8">-8px</button>
    `,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipOffsetExample {}
