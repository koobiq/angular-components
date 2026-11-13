import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertColors, KbqAlertStyles, KbqAlertTitle } from '@koobiq/components/alert';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Alert status
 */
@Component({
    selector: 'alert-status-example',
    imports: [
        KbqAlert,
        KbqAlertTitle,
        KbqIcon
    ],
    templateUrl: 'alert-status-example.html',
    styleUrls: ['alert-status-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertStatusExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    colors = KbqComponentColors;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;
}
