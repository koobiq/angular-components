import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from '../l10n';

/**
 * @title Badge tooltip
 */
@Component({
    selector: 'badge-tooltip-example',
    imports: [
        KbqBadgeModule,
        KbqToolTipModule
    ],
    template: `
        <div class="example-badge-tooltip">
            <kbq-badge
                [badgeColor]="colors.FadeContrast"
                [kbqPlacement]="PopUpPlacements.Top"
                [kbqTooltipArrow]="false"
                [kbqTooltip]="text().dosTooltip"
            >
                DoS
            </kbq-badge>
        </div>
    `,
    styleUrls: ['badge-tooltip-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeTooltipExample {
    protected readonly text = injectExampleText();

    colors = KbqBadgeColors;
    protected readonly PopUpPlacements = PopUpPlacements;
}
