import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Alerts
 */
@Component({
    selector: 'alerts-overview-example',
    templateUrl: 'alerts-overview-example.html',
    styleUrls: ['alerts-overview-example.css'],
    animations: [
        trigger('hideShowAnimator', [
            state('true' , style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.5s')),
            transition('true => false', animate('.2s'))
        ])
    ],
    encapsulation: ViewEncapsulation.None
})
export class AlertsOverviewExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
}
