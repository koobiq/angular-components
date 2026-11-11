import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { injectExampleText } from '../l10n';

/**
 * @title Button group overview
 */
@Component({
    selector: 'button-group-overview-example',
    imports: [KbqButtonModule],
    template: `
        <div kbq-button-group>
            @for (item of data(); track item) {
                <button kbq-button>
                    {{ item }}
                </button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-xl'
    }
})
export class ButtonGroupOverviewExample {
    protected readonly text = injectExampleText();

    protected readonly data = computed(() => [this.text().archive, this.text().report, this.text().snooze]);

    protected readonly color = KbqComponentColors.ContrastFade;
    protected readonly style = KbqButtonStyles.Filled;
}
