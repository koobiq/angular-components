import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle alignment
 */
@Component({
    selector: 'button-toggle-alignment-overview-example',
    imports: [
        KbqButtonToggleModule,
        FormsModule,
        KbqIconModule
    ],
    templateUrl: 'button-toggle-alignment-overview-example.html',
    styleUrls: ['button-toggle-alignment-overview-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleAlignmentOverviewExample {
    group = [
        'Курьером',
        'Ослик Экспресс',
        'Почтой Средиземья'
    ];

    model = 0;
}
