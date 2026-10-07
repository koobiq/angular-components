import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton, KbqAlertControl, KbqAlertTitle } from '@koobiq/components/alert';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton, KbqIconItem } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';

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
        KbqIcon,
        KbqIconItem,
        KbqIconButton
    ],
    templateUrl: 'alert-content-example.html',
    styleUrls: ['alert-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertContentExample {
    colors = KbqComponentColors;
    firstState = true;
    secondState = true;
}
