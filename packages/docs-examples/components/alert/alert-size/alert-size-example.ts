import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Alert Size
 */
@Component({
    standalone: true,
    selector: 'alert-size-example',
    templateUrl: 'alert-size-example.html',
    styleUrl: 'alert-size-example.css',
    animations: [
        trigger('hideShowAnimator', [
            state('true', style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.5s')),
            transition('true => false', animate('.2s'))])

    ],
    imports: [
        KbqAlertModule,
        KbqLinkModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class AlertSizeExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
    text =
        'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит основной текст и заголовок — ставьте точку в конце основного текста.';
}
