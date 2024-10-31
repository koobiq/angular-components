import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button overview
 */
@Component({
    standalone: true,
    selector: 'button-overview-example',
    styleUrl: 'button-overview-example.css',
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqButtonModule,
        KbqCheckboxModule,
        FormsModule
    ],
    template: `
        <button
            class="overview__example-button"
            [class.kbq-progress]="hasProgress"
            [color]="colors.Contrast"
            [disabled]="isDisabled"
            kbq-button
        >
            Кнопка
        </button>
        <br />
        <kbq-checkbox [(ngModel)]="isDisabled">disabled</kbq-checkbox>
        <kbq-checkbox [(ngModel)]="hasProgress">progress</kbq-checkbox>
    `
})
export class ButtonOverviewExample {
    colors = KbqComponentColors;
    isDisabled = false;
    hasProgress = false;
}
