import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle tooltip
 */
@Component({
    standalone: true,
    selector: 'button-toggle-tooltip-overview-example',
    styleUrl: 'button-toggle-tooltip-overview-example.css',
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqButtonToggleModule,
        FormsModule,
        KbqIconModule
    ],
    template: `
        <div class="kbq-button-toggle-group_stretched layout-margin-bottom-l">
            <kbq-button-toggle-group
                class="kbq-button-toggle-group_stretched"
                [(ngModel)]="model"
            >
                @for (toggle of group; track toggle; let i = $index) {
                    <kbq-button-toggle [value]="i">
                        {{ toggle }}
                    </kbq-button-toggle>
                }
            </kbq-button-toggle-group>
        </div>

        <div>
            <kbq-button-toggle-group
                class="kbq-button-toggle-group_stretched"
                [(ngModel)]="model"
            >
                @for (toggle of group; track toggle; let i = $index) {
                    <kbq-button-toggle [value]="i">
                        <i kbq-icon="kbq-briefcase_16"></i>
                        <span>{{ toggle }}</span>
                    </kbq-button-toggle>
                }
            </kbq-button-toggle-group>
        </div>
    `
})
export class ButtonToggleTooltipOverviewExample {
    group = [
        'Длинный текст кнопки-переключателя, чтобы показать, как обрезается текст',
        'Ослик Экспресс',
        'Почтой Средиземья'
    ];

    model = 1;
}
