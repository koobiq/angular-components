import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqLink } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Badge table
 */
@Component({
    selector: 'badge-table-example',
    imports: [
        KbqBadgeModule,
        KbqLink,
        KbqTableModule
    ],
    templateUrl: 'badge-table-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeTableExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    colors = KbqBadgeColors;
}
