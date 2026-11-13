import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
    protected readonly t = injectTranslation(TRANSLATIONS);

    colors = KbqBadgeColors;
}
