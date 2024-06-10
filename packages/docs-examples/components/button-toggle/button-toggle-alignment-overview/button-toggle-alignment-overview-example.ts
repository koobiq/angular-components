import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title button-toggle-alignment
 */
@Component({
    selector: 'button-toggle-alignment-overview-example',
    templateUrl: 'button-toggle-alignment-overview-example.html',
    styleUrls: ['button-toggle-alignment-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonToggleAlignmentOverviewExample {
    group = [
        'Курьером',
        'Ослик Экспресс',
        'Почтой Средиземья'
    ];

    model = 0;
}
