import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag Long Text
 */
@Component({
    selector: 'tag-long-text-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    template: `
        <kbq-tag [color]="colors.ContrastFade">
            Typically, tags are associated with the «Delete» button, allowing users to remove the selected value from
            the input field. However, there are instances when it is desirable to prevent the deletion of a tag, in
            which case the cross must be concealed.
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-5xl layout-margin-bottom-5xl layout-margin-left-m layout-margin-right-m layout-align-center-center layout-row'
    }
})
export class TagLongTextExample {
    colors = KbqComponentColors;
}
