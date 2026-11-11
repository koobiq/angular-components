import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { injectExampleText } from '../l10n';

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
            {{ text().truncatedButtonText }}
        </button>
    `,
    styleUrls: ['button-fill-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonFillContentExample {
    protected readonly text = injectExampleText();

    colors = KbqComponentColors;
}
