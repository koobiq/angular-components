import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title button-toggle-tooltip
 */
@Component({
    selector: 'button-toggle-tooltip-overview-example',
    templateUrl: 'button-toggle-tooltip-overview-example.html',
    styleUrls: ['button-toggle-tooltip-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonToggleTooltipOverviewExample {
    group = [
        'Длинный текст кнопки-переключателя, чтобы показать, как обрезается текст',
        'Ослик Экспресс',
        'Почтой Средиземья'
    ];

    model = 1;
}
