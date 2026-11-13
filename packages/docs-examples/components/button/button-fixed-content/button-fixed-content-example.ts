import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
            <button class="example-fixed-content__button" kbq-button [color]="colors.Contrast">
                {{ t().buttonText }}
            </button>
            &nbsp;
            <br />
            <button class="example-fixed-content__button" kbq-button [color]="colors.Contrast">
                {{ t().longButtonText }}
            </button>
            &nbsp;
        </div>
    `,
    styleUrls: ['button-fixed-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonFixedContentExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    colors = KbqComponentColors;
}
