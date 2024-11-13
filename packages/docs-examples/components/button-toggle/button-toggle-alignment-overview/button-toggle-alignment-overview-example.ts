import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle alignment
 */
@Component({
    standalone: true,
    selector: 'button-toggle-alignment-overview-example',
    templateUrl: 'button-toggle-alignment-overview-example.html',
    styleUrls: ['button-toggle-alignment-overview-example.css'],
    imports: [
        KbqButtonToggleModule,
        FormsModule,
        KbqIconModule
    ]
})
export class ButtonToggleAlignmentOverviewExample {
    group = [
        'Курьером',
        'Ослик Экспресс',
        'Почтой Средиземья'
    ];

    model = 0;
}
