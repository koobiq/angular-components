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
        <div class="layout-row layout-align-center-center" style="min-height: 120px; gap: var(--kbq-size-m);">
            @for (item of [1, 2, 3, 4, 5, 6]; track item) {
                <button kbqTooltip="Action{{ item }}" kbq-button>
                    <i kbq-icon="kbq-diamond_16"></i>
                </button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipHideWithTimeoutExample {}
