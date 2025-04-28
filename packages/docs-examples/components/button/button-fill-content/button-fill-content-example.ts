import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button fill content
 */
@Component({
    standalone: true,
    selector: 'button-fill-content-example',
    styleUrls: ['button-fill-content-example.css'],
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="example-fill-content__button" [color]="colors.Contrast" kbq-button>
            Очень длинный текст кнопки, который не умеет обрезаться по ширине
        </button>
    `
})
export class ButtonFillContentExample {
    colors = KbqComponentColors;
}
