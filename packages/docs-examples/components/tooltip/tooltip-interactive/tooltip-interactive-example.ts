import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title tooltip-interactive
 */
@Component({
    selector: 'tooltip-interactive-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-column" style="gap: 16px; align-items: flex-start">
            <button kbq-button kbqTooltip="Тултип" [ignoreTooltipPointerEvents]="false" [hideWithTimeout]="true">
                Кнопка с тултипом
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipInteractiveExample {}
