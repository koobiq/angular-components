import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertControl, KbqAlertTitle } from '@koobiq/components/alert';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Alert size
 */
@Component({
    selector: 'alert-overview-example',
    imports: [
        KbqAlert,
        KbqAlertTitle,
        KbqAlertControl,
        KbqButton,
        KbqButtonCssStyler,
        KbqIcon,
        KbqIconItem
    ],
    templateUrl: 'alert-overview-example.html',
    styleUrls: ['alert-overview-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
