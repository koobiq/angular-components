import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Button loading state
 */
@Component({
    selector: 'button-loading-state-example',
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="kbq-progress" kbq-button [color]="colors.Contrast">{{ t().button }}</button>
        &nbsp;
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonLoadingStateExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    colors = KbqComponentColors;
}
