import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from './l10n';

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
        @for (item of [1, 2, 3, 4, 5, 6]; track item) {
            <button kbq-button [kbqTooltip]="'Action' + item" [attr.aria-label]="text().diamond">
                <i kbq-icon="kbq-diamond_16"></i>
            </button>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-m'
    }
})
export class TooltipHideWithTimeoutExample {
    protected readonly text = injectExampleText();
}
