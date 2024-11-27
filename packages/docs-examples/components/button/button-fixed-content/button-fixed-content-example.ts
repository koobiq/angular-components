import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button fixed content
 */
@Component({
    standalone: true,
    selector: 'button-fixed-content-example',
    styleUrls: ['button-fixed-content-example.css'],
    imports: [
        KbqButtonModule
    ],
    template: `
        <div class="fixed-content__example-button-group">
            <button class="fixed-content__example-button" [color]="colors.Contrast" kbq-button>Текст кнопки</button>
            &nbsp;
            <br />
            <button class="fixed-content__example-button" [color]="colors.Contrast" kbq-button>
                Очень длинный текст кнопки
            </button>
            &nbsp;
        </div>
    `
})
export class ButtonFixedContentExample {
    colors = KbqComponentColors;
}
