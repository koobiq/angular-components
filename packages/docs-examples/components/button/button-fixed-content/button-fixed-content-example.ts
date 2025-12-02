import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button fixed content
 */
@Component({
    selector: 'button-fixed-content-example',
    imports: [
        KbqButtonModule
    ],
    template: `
        <div class="example-fixed-content__button-group">
            <button class="example-fixed-content__button" kbq-button [color]="colors.Contrast">Текст кнопки</button>
            &nbsp;
            <br />
            <button class="example-fixed-content__button" kbq-button [color]="colors.Contrast">
                Очень длинный текст кнопки
            </button>
            &nbsp;
        </div>
    `,
    styleUrls: ['button-fixed-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonFixedContentExample {
    colors = KbqComponentColors;
}
