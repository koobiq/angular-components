import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Alert Close
 */
@Component({
    selector: 'alert-close-example',
    templateUrl: 'alert-close-example.html',
    styleUrls: ['alert-close-example.css'],
    animations: [
        trigger('hideShowAnimator', [
            state('true', style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.5s')),
            transition('true => false', animate('.2s')),
        ]),
    ],
    encapsulation: ViewEncapsulation.None,
})
export class AlertCloseExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
    state = true;
}
