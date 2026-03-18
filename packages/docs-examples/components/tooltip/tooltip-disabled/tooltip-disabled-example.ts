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
        <button kbq-button kbqTooltip="This item is locked and cannot be deleted" [disabled]="true">
            <i kbq-icon="kbq-trash_16"></i>
            Delete
        </button>
    `,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipDisabledExample {}
