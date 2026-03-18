import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip
 */
@Component({
    selector: 'tooltip-overview-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    template: `
        <button kbq-button kbqTooltip="Create">
            <i kbq-icon="kbq-plus_16"></i>
        </button>
    `,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipOverviewExample {}
