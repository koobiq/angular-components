import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title tooltip-hide-with-timeout
 */
@Component({
    selector: 'tooltip-hide-with-timeout-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <div class="layout-column" style="gap: 16px; align-items: flex-start">
            <button kbq-button kbqTooltip="Тултип" [hideWithTimeout]="true">Кнопка с тултипом</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipHideWithTimeoutExample {}
