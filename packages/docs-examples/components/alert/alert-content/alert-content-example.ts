import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqIconButton } from '@koobiq/components/icon';

/**
 * @title Alert
 */
@Component({
    standalone: true,
    selector: 'alert-content-example',
    templateUrl: 'alert-content-example.html',
    styleUrl: 'alert-content-example.css',
    animations: [
        trigger('hideShowAnimator', [
            state('true', style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.5s')),
            transition('true => false', animate('.2s'))])

    ],
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqAlertModule,
        KbqButtonModule,
        KbqLinkModule,
        KbqIconButton
    ]
})
export class AlertContentExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;
    state = true;
}
