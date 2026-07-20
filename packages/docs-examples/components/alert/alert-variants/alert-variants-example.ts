import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertColors, KbqAlertStyles, KbqAlertTitle } from '@koobiq/components/alert';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';

/**
 * @title Alert variants
 */
@Component({
    selector: 'alert-variants-example',
    imports: [
        KbqAlert,
        KbqAlertTitle,
        KbqIcon,
        KbqIconItem
    ],
    template: `
        <div class="layout-row example-row layout-gap-l flex-100">
            <div class="layout-column example-column">
                <kbq-alert [alertColor]="alertColors.Error">
                    <i aria-hidden="true" kbq-icon-item="kbq-triangle-exclamation_16" [color]="colors.Error"></i>
                    <div kbq-alert-title>Default</div>
                    {{ text }}
                </kbq-alert>
            </div>
            <div class="layout-column example-column">
                <kbq-alert [alertColor]="alertColors.Error" [alertStyle]="alertStyles.Colored" [compact]="true">
                    <i aria-hidden="true" kbq-icon="kbq-triangle-exclamation_16" [color]="colors.Error"></i>
                    <div kbq-alert-title>Colored</div>
                    {{ text }}
                </kbq-alert>
            </div>
        </div>
    `,
    styleUrls: ['alert-variants-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertVariantsExample {
    colors = KbqComponentColors;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;
    text =
        'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит основной текст и заголовок — ставьте точку в конце основного текста.';
}
