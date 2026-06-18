import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';

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
            <div class="kbq-subheading">Plain string content</div>
            <div class="example-title-custom-content__row kbq-text-normal" [kbq-title]="stringContent">
                {{ longValue }}
            </div>

            <div class="kbq-subheading">Rich template content</div>
            <div class="example-title-custom-content__row kbq-text-normal" [kbq-title]="templateContent">
                {{ longValue }}
            </div>
        </div>

        <ng-template #templateContent>
            <div class="example-title-custom-content__tooltip">
                <i kbq-icon="kbq-circle-info_16"></i>
                <span>Rich tooltip with custom markup</span>
            </div>
        </ng-template>
    `,
    styleUrls: ['./title-custom-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleCustomContentExample {
    longValue = 'A long text that does not fit into the container and is truncated with an ellipsis';
    stringContent = 'Tooltip content provided as a plain string';
}
