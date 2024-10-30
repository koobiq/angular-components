import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';

/**
 * @title Button toggle alignment
 */
@Component({
    standalone: true,
    selector: 'button-toggle-alignment-overview-example',
    templateUrl: 'button-toggle-alignment-overview-example.html',
    styleUrl: 'button-toggle-alignment-overview-example.css',
    imports: [
        KbqButtonToggleModule,
        FormsModule
    ],
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
