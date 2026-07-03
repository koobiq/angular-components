import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle tooltip
 */
@Component({
    selector: 'button-toggle-tooltip-overview-example',
    imports: [
        KbqButtonToggleModule,
        FormsModule,
        KbqIconModule
    ],
    template: `
        <kbq-button-toggle-group class="layout-margin-bottom-l" stretched [(ngModel)]="model">
            @for (toggle of group; track toggle) {
                <kbq-button-toggle [value]="$index">
                    {{ toggle }}
                </kbq-button-toggle>
            }
        </kbq-button-toggle-group>

        <kbq-button-toggle-group stretched [(ngModel)]="model">
            @for (toggle of group; track toggle) {
                <kbq-button-toggle [value]="$index">
                    <i kbq-icon="kbq-briefcase_16"></i>
                    <span>{{ toggle }}</span>
                </kbq-button-toggle>
            }
        </kbq-button-toggle-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleTooltipOverviewExample {
    group = [
        'Длинный текст кнопки-переключателя, чтобы показать, как обрезается текст',
        'Ослик Экспресс',
        'Почтой Средиземья'
    ];

    model = 1;
}
