import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { injectExampleText } from '../l10n';

/**
 * @title Button loading state
 */
@Component({
    selector: 'button-loading-state-example',
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="kbq-progress" kbq-button [color]="colors.Contrast">{{ text().button }}</button>
        &nbsp;
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonLoadingStateExample {
    protected readonly text = injectExampleText();

    colors = KbqComponentColors;
}
