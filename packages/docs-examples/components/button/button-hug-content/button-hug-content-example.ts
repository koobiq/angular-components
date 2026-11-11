import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { injectExampleText } from '../l10n';

/**
 * @title Button hug content
 */
@Component({
    selector: 'button-hug-content-example',
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="example-hug-content__button" kbq-button [color]="colors.Contrast">
            {{ text().buttonText }}
        </button>
        &nbsp;
        <br />
        <button class="example-hug-content__button" kbq-button [color]="colors.Contrast">
            {{ text().longButtonText }}
        </button>
        &nbsp;
    `,
    styleUrls: ['button-hug-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonHugContentExample {
    protected readonly text = injectExampleText();

    colors = KbqComponentColors;
}
