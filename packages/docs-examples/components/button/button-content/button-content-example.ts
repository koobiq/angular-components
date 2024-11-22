import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button content
 */
@Component({
    standalone: true,
    selector: 'button-content-example',
    styleUrls: ['button-content-example.css'],
    imports: [
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <div class="content__example-button-group">
            <div class="example-button">
                <div class="example-label kbq-text-compact">Text</div>
                <button [color]="colors.Contrast" kbq-button>Кнопка</button>
            </div>
            <div class="example-button kbq-text-compact">
                <div class="example-label kbq-text-compact">Icon+Text</div>
                <button [color]="colors.Contrast" kbq-button>
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
