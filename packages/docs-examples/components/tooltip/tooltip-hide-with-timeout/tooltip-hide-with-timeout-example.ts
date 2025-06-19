import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title tooltip-hide-with-timeout
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tooltip-hide-with-timeout-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <div class="layout-column" style="gap: 16px; align-items: flex-start">
            <button [hideWithTimeout]="true" kbq-button kbqTooltip="Тултип">Кнопка с тултипом</button>
        </div>
    `
})
export class TooltipHideWithTimeoutExample {}
