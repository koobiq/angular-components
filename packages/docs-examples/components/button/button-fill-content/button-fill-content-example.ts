import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button fill content
 */
@Component({
    selector: 'button-fill-content-example',
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="example-fill-content__button" kbq-button [color]="colors.Contrast">
            Очень длинный текст кнопки, который не умеет обрезаться по ширине
        </button>
    `,
    styleUrls: ['button-fill-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonFillContentExample {
    colors = KbqComponentColors;
}
