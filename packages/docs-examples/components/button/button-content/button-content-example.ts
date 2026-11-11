import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Button content
 */
@Component({
    selector: 'button-content-example',
    imports: [
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <div class="example-content__button-group">
            <div class="example-button">
                <div class="example-label kbq-text-compact">Text</div>
                <button kbq-button [color]="colors.Contrast">{{ text().button }}</button>
            </div>
            <div class="example-button">
                <div class="example-label kbq-text-compact">Icon+Text</div>
                <button kbq-button [color]="colors.Contrast">
                    <i kbqButtonPrefix kbq-icon="kbq-plus_16"></i>
                    {{ text().button }}
                </button>
            </div>
            <div class="example-button">
                <div class="example-label kbq-text-compact">Text+Icon</div>
                <button kbq-button [color]="colors.Contrast">
                    {{ text().button }}
                    <i kbqButtonSuffix kbq-icon="kbq-plus_16"></i>
                </button>
            </div>
            <div class="example-button">
                <div class="example-label kbq-text-compact">Icon+Text+Icon</div>
                <button kbq-button [color]="colors.Contrast">
                    <i kbqButtonPrefix kbq-icon="kbq-plus_16"></i>
                    {{ text().button }}
                    <i kbqButtonSuffix kbq-icon="kbq-plus_16"></i>
                </button>
            </div>
            <div class="example-button">
                <div class="example-label kbq-text-compact">Slots (order-independent)</div>
                <button kbq-button [color]="colors.Contrast">
                    <i kbqButtonSuffix kbq-icon="kbq-plus_16"></i>
                    {{ text().button }}
                    <i kbqButtonPrefix kbq-icon="kbq-plus_16"></i>
                </button>
            </div>
        </div>
    `,
    styleUrls: ['button-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonContentExample {
    protected readonly text = injectExampleText();

    colors = KbqComponentColors;
}
