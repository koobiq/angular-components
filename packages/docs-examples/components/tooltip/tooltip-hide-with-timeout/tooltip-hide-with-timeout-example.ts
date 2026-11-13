import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title tooltip-hide-with-timeout
 */
@Component({
    selector: 'tooltip-hide-with-timeout-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    template: `
        @for (action of ['Action1', 'Action2', 'Action3', 'Action4', 'Action5', 'Action6']; track action) {
            <button kbq-button type="button" aria-label="Diamond" [kbqTooltip]="action">
                <i kbq-icon="kbq-diamond_16"></i>
            </button>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-m'
    }
})
export class TooltipHideWithTimeoutExample {}
