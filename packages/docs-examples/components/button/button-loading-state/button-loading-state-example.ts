import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button loading state
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'button-loading-state-example',
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="kbq-progress" [color]="colors.Contrast" kbq-button>Кнопка</button>
        &nbsp;
    `
})
export class ButtonLoadingStateExample {
    colors = KbqComponentColors;
}
