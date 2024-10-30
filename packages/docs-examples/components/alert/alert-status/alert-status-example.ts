import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Alert Status
 */
@Component({
    standalone: true,
    selector: 'alert-status-example',
    templateUrl: 'alert-status-example.html',
    styleUrl: 'alert-status-example.css',
    animations: [
        trigger('hideShowAnimator', [
            state('true', style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.5s')),
            transition('true => false', animate('.2s'))])

    ],
    imports: [
        KbqAlertModule,
        KbqIconModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class AlertStatusExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;
    text =
        'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит основной текст и заголовок — ставьте точку в конце основного текста';
}
