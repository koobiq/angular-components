import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button loading state
 */
@Component({
    selector: 'button-loading-state-example',
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="kbq-progress" kbq-button [color]="colors.Contrast">Кнопка</button>
        &nbsp;
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonLoadingStateExample {
    colors = KbqComponentColors;
}
