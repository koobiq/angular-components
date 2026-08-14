import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag with icon
 */
@Component({
    selector: 'tag-with-icon-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    template: `
        <kbq-tag [color]="colors.ContrastFade">
            <i kbqTagPrefix kbq-icon="kbq-diamond-o_16"></i>
            Tag
            <i kbqTagSuffix kbq-icon="kbq-diamond_16"></i>
        </kbq-tag>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class TagWithIconExample {
    colors = KbqComponentColors;
}
