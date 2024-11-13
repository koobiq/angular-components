import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Alert close
 */
@Component({
    standalone: true,
    selector: 'alert-close-example',
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
        KbqIconModule
    ],
    template: `
        <kbq-alert
            class="flex-100"
            [@hideShowAnimator]="state"
            [compact]="true"
        >
            <i kbq-icon="kbq-info-circle_16"></i>
            Блок скрывается по крестику в углу, не дублируйте эту возможность с помощью кнопки под текстом сообщения
            <i
                [color]="colors.ContrastFade"
                (click)="state = !state"
                kbq-alert-close-button
                kbq-icon-button="kbq-xmark-s_16"
            ></i>
        </kbq-alert>
    `
})
export class AlertCloseExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
    state = true;
}
