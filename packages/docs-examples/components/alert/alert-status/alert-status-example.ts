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
        'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит основной текст и заголовок — ставьте точку в конце основного текста';
}
