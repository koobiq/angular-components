import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton, KbqAlertControl, KbqAlertTitle } from '@koobiq/components/alert';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { kbqAnimationsDisabled, KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton, KbqIconItem } from '@koobiq/components/icon';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Alert content
 */
@Component({
    selector: 'alert-content-example',
    imports: [
        KbqAlert,
        KbqAlertTitle,
        KbqAlertControl,
        KbqAlertCloseButton,
        KbqButton,
        KbqButtonCssStyler,
        KbqLink,
        KbqLinkSuffix,
        KbqIcon,
        KbqIconItem,
        KbqIconButton
    ],
    templateUrl: 'alert-content-example.html',
    styleUrls: ['alert-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertContentExample extends BaseLocalizedExample<ExampleText> {
    protected readonly animationsDisabled = kbqAnimationsDisabled();
    colors = KbqComponentColors;
    firstState = true;
    secondState = true;

    constructor() {
        super(TEXT);
    }
}
