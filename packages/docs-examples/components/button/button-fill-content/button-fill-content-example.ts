import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
export class ButtonFillContentExample extends BaseLocalizedExample<ExampleText> {
    colors = KbqComponentColors;

    constructor() {
        super(TEXT);
    }
}
