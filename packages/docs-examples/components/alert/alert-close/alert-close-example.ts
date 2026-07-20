import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton } from '@koobiq/components/alert';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';

/**
 * @title Alert close
 */
@Component({
    selector: 'alert-close-example',
    imports: [
        KbqAlert,
        KbqAlertCloseButton,
        KbqIcon,
        KbqIconButton
    ],
    template: `
        <kbq-alert class="flex-100" [@hideShowAnimator]="state" [compact]="true" (closed)="state = false">
            <i aria-hidden="true" kbq-icon="kbq-circle-info_16"></i>
            Блок скрывается по крестику в углу, не дублируйте эту возможность с помощью кнопки под текстом сообщения
            <button
                kbq-alert-close-button
                kbq-icon-button="kbq-xmark-s_16"
                aria-label="Закрыть"
                [color]="colors.ContrastFade"
            ></button>
        </kbq-alert>
    `,
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
export class AlertCloseExample {
    colors = KbqComponentColors;
    state = true;
}
