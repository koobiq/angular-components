import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Alert size
 */
@Component({
    selector: 'alert-overview-example',
    imports: [
        KbqAlertModule,
        KbqLinkModule
    ],
    templateUrl: 'alert-overview-example.html',
    styleUrls: ['alert-overview-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('hideShowAnimator', [
            state('true', style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.5s')),
            transition('true => false', animate('.2s'))
        ])
    ]
})
export class AlertOverviewExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
    text =
        'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит основной текст и заголовок — ставьте точку в конце основного текста.';
}
