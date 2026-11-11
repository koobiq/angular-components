import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { injectExampleText } from './l10n';

/**
 * @title Button group content
 */
@Component({
    selector: 'button-group-content-example',
    imports: [
        KbqButtonModule,
        KbqIcon
    ],
    template: `
        <div kbq-button-group>
            @for (item of data(); track item) {
                <button kbq-button class="kbq-dropdown-trigger">
                    <i kbqButtonPrefix kbq-icon="kbq-diamond_16"></i>
                    {{ item }}
                    <i kbqButtonSuffix kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            }
        </div>

        <div kbq-button-group>
            @for (item of data(); track item) {
                <button kbq-button>
                    <i kbqButtonPrefix kbq-icon="kbq-diamond_16"></i>
                    {{ item }}
                </button>
            }
        </div>

        <div kbq-button-group>
            @for (item of data(); track item) {
                <button kbq-button>
                    {{ item }}
                </button>
            }
        </div>

        <div kbq-button-group>
            @for (item of data(); track item) {
                <button kbq-button class="kbq-dropdown-trigger" [attr.aria-label]="text().diamondOptions">
                    <i kbq-icon="kbq-diamond_16"></i>
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            }
        </div>

        <div kbq-button-group>
            @for (item of data(); track item) {
                <button kbq-button [attr.aria-label]="text().diamond">
                    <i kbq-icon="kbq-diamond_16"></i>
                </button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-l'
    }
})
export class ButtonGroupContentExample {
    protected readonly text = injectExampleText();

    protected readonly data = computed(() => [this.text().archive, this.text().report, this.text().snooze]);
}
