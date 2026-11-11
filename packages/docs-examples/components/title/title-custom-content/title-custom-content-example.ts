import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { injectExampleText } from '../l10n';

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
            <div class="kbq-subheading">{{ text().plainStringContent }}</div>
            <div class="example-title-custom-content__row kbq-text-normal" [kbq-title]="stringContent">
                {{ longValue }}
            </div>

            <div class="kbq-subheading">{{ text().richTemplateContent }}</div>
            <div class="example-title-custom-content__row kbq-text-normal" [kbq-title]="templateContent">
                {{ longValue }}
            </div>
        </div>

        <ng-template #templateContent>
            <div class="example-title-custom-content__tooltip">
                <i kbq-icon="kbq-circle-info_16" style="color: var(--kbq-icon-white)"></i>
                <span>{{ text().richTooltip }}</span>
            </div>
        </ng-template>
    `,
    styleUrls: ['./title-custom-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleCustomContentExample {
    protected readonly text = injectExampleText();

    longValue = this.text().longValue;
    stringContent = this.text().stringContent;
}
