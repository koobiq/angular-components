import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Alert Variants
 */
@Component({
    standalone: true,
    selector: 'alert-variants-example',
    styleUrl: 'alert-variants-example.css',
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
        <div class="layout-row flex-100">
            <div class="layout-column">
                <kbq-alert [alertColor]="alertColors.Error">
                    <i
                        [color]="colors.Error"
                        kbq-icon-item="kbq-exclamation-triangle_16"
                    ></i>
                    <div kbq-alert-title>Default</div>
                    {{ text }}
                </kbq-alert>
            </div>
            <div class="layout-column">
                <kbq-alert
                    [alertColor]="alertColors.Error"
                    [alertStyle]="alertStyles.Colored"
                    [compact]="true"
                >
                    <i
                        [color]="colors.Error"
                        kbq-icon="kbq-exclamation-triangle_16"
                    ></i>
                    <div kbq-alert-title>Colored</div>
                    {{ text }}
                </kbq-alert>
            </div>
        </div>
    `
})
export class AlertVariantsExample {
    colors = KbqComponentColors;
    style = KbqButtonStyles;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;
    text =
        'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит основной текст и заголовок — ставьте точку в конце основного текста.';
}
