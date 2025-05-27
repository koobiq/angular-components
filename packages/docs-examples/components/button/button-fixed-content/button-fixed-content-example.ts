import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button fixed content
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'button-fixed-content-example',
    styleUrls: ['button-fixed-content-example.css'],
    imports: [
        KbqButtonModule
    ],
    template: `
        <div class="example-fixed-content__button-group">
            <button class="example-fixed-content__button" [color]="colors.Contrast" kbq-button>Текст кнопки</button>
            &nbsp;
            <br />
            <button class="example-fixed-content__button" [color]="colors.Contrast" kbq-button>
                Очень длинный текст кнопки
            </button>
            &nbsp;
        </div>
    `
})
export class ButtonFixedContentExample {
    colors = KbqComponentColors;
}
