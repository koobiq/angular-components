import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag
 */
@Component({
    selector: 'tag-overview-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    template: `
        <kbq-tag [color]="colors.ContrastFade">
            Tag
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class TagOverviewExample {
    colors = KbqComponentColors;
}
