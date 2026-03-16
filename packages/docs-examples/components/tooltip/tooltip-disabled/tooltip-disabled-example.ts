import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip disabled
 */
@Component({
    selector: 'tooltip-disabled-example',
    imports: [KbqToolTipModule, KbqButtonModule, KbqIconModule],
    template: `
        <div class="layout-row layout-align-center-center" style="min-height: 120px;">
            <button kbq-button kbqTooltip="This item is locked and cannot be deleted" [disabled]="true">
                <i kbq-icon="kbq-trash_16"></i>
                Delete
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipDisabledExample {}
