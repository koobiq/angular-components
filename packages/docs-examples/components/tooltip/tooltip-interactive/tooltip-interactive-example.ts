import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
            <button kbq-button [kbqTooltip]="t().tooltip" [hideWithTimeout]="true">
                {{ t().buttonWithTooltip }}
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipInteractiveExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
