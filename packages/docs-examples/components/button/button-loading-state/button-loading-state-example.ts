import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button loading state
 */
@Component({
    standalone: true,
    selector: 'button-loading-state-example',
    styleUrl: 'button-loading-state-example.css',
    encapsulation: ViewEncapsulation.None,
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
