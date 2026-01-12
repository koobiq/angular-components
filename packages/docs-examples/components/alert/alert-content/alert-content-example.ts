import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Alert content
 */
@Component({
    selector: 'alert-content-example',
    imports: [
        KbqAlertModule,
        KbqButtonModule,
        KbqLinkModule,
        KbqIconModule
    ],
    templateUrl: 'alert-content-example.html',
    styleUrls: ['alert-content-example.css'],
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
export class AlertContentExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;
    state = true;
}
