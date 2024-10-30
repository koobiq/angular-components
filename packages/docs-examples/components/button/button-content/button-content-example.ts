import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button content
 */
@Component({
    standalone: true,
    selector: 'button-content-example',
    styleUrl: 'button-content-example.css',
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqButtonModule
    ],
    template: `
        <div class="content__example-button-group">
            <div class="example-button">
                <div class="example-label kbq-extra-small-text">Text</div>
                <button
                    [color]="colors.Contrast"
                    kbq-button
                >
                    Кнопка
                </button>
            </div>
            <div class="example-button kbq-extra-small-text">
                <div class="example-label kbq-extra-small-text">Icon+Text</div>
                <button
                    [color]="colors.Contrast"
                    kbq-button
                >
                    <i kbq-icon="kbq-plus_16"></i>
                    Кнопка
                </button>
            </div>
        </div>
    `
})
export class ButtonContentExample {
    colors = KbqComponentColors;
}
