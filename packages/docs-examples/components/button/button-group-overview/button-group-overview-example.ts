import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
export class ButtonGroupOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly data = computed(() => [this.t().archive, this.t().report, this.t().snooze]);

    protected readonly color = KbqComponentColors.ContrastFade;
    protected readonly style = KbqButtonStyles.Filled;

    constructor() {
        super(TRANSLATIONS);
    }
}
