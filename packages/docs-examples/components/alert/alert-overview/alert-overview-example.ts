import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertControl, KbqAlertTitle } from '@koobiq/components/alert';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';

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
export class AlertOverviewExample {
    text =
        'If there is no heading, do not put a period at the end of the last sentence. If the message contains both body text and a heading, put a period at the end of the body text.';
}
