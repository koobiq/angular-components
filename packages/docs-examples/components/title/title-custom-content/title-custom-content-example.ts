import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Custom tooltip content
 */
@Component({
    selector: 'title-custom-content-example',
    imports: [
        KbqTitleModule,
        KbqIconModule
    ],
    template: `
        <div class="example-title-custom-content">
            <div class="kbq-subheading">{{ t().plainStringContent }}</div>
            <div class="example-title-custom-content__row kbq-text-normal" [kbq-title]="stringContent()">
                {{ longValue() }}
            </div>

            <div class="kbq-subheading">{{ t().richTemplateContent }}</div>
            <div class="example-title-custom-content__row kbq-text-normal" [kbq-title]="templateContent">
                {{ longValue() }}
            </div>
        </div>

        <ng-template #templateContent>
            <div class="example-title-custom-content__tooltip">
                <i kbq-icon="kbq-circle-info_16" style="color: var(--kbq-icon-white)"></i>
                <span>{{ t().richTooltip }}</span>
            </div>
        </ng-template>
    `,
    styleUrls: ['./title-custom-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleCustomContentExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly longValue = computed(() => this.t().longValue);
    readonly stringContent = computed(() => this.t().stringContent);

    constructor() {
        super(TRANSLATIONS);
    }
}
