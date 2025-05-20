import { Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag with icon
 */
@Component({
    standalone: true,
    selector: 'tag-with-icon-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    template: `
        <kbq-tag [color]="colors.ContrastFade">
            <i kbq-icon="kbq-diamond-o_16"></i>
            Tag
        </kbq-tag>
    `
})
export class TagWithIconExample {
    colors = KbqComponentColors;
}
