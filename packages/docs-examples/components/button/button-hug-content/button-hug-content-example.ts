import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button hug content
 */
@Component({
    standalone: true,
    selector: 'button-hug-content-example',
    styleUrls: ['button-hug-content-example.css'],
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="hug-content__example-button" [color]="colors.Contrast" kbq-button>Текст кнопки</button>
        &nbsp;
        <br />
        <button class="hug-content__example-button" [color]="colors.Contrast" kbq-button>
            Очень длинный текст кнопки
        </button>
        &nbsp;
    `
})
export class ButtonHugContentExample {
    colors = KbqComponentColors;
}
