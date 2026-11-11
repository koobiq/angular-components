import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { injectExampleText } from '../l10n';

/**
 * @title Badge fill and style
 */
@Component({
    selector: 'badge-overview-example',
    imports: [
        KbqBadgeModule
    ],
    templateUrl: 'badge-overview-example.html',
    styleUrls: ['badge-overview-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeOverviewExample {
    protected readonly text = injectExampleText();

    colors = KbqBadgeColors;
}
