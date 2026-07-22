import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertColors, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title Alert status
 */
@Component({
    selector: 'alert-status-example',
    imports: [
        KbqAlert,
        KbqIcon
    ],
    templateUrl: 'alert-status-example.html',
    styleUrls: ['alert-status-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertStatusExample {
    colors = KbqComponentColors;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;
    text =
        'If there is no heading, do not put a period at the end of the last sentence. If the message contains both body text and a heading, put a period at the end of the body text';
}
