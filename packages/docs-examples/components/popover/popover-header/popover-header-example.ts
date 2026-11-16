import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Popover Header
 */
@Component({
    selector: 'popover-header-example',
    imports: [
        KbqDl,
        KbqDt,
        KbqDd,
        KbqPopoverModule,
        KbqButtonModule,
        KbqBadgeModule
    ],
    templateUrl: 'popover-header-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverHeaderExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    badgeColors = KbqBadgeColors;
}
