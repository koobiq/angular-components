import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button loading state
 */
@Component({
    standalone: true,
    selector: 'button-loading-state-example',
    styleUrls: ['button-loading-state-example.css'],
    imports: [
        KbqButtonModule
    ],
    template: `
        <button
            class="kbq-progress"
            [color]="colors.Contrast"
            kbq-button
        >
            Кнопка
        </button>
        &nbsp;
    `
})
export class ButtonLoadingStateExample {
    colors = KbqComponentColors;
}
