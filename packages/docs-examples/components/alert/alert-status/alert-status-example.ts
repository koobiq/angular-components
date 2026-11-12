import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertColors, KbqAlertStyles, KbqAlertTitle } from '@koobiq/components/alert';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
export class AlertStatusExample extends BaseLocalizedExample<ExampleText> {
    colors = KbqComponentColors;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;

    constructor() {
        super(TEXT);
    }
}
