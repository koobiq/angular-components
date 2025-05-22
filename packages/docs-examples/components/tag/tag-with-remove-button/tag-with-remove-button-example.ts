import { Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag with remove button
 */
@Component({
    standalone: true,
    selector: 'tag-with-remove-button-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    host: {
        class: 'layout-row layout-wrap layout-gap-l layout-margin-5xl layout-align-center-center'
    },
    template: `
        <kbq-tag [color]="colors.ContrastFade">
            Tag
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
        <kbq-tag [color]="colors.ContrastFade">Tag</kbq-tag>
    `
})
export class TagWithRemoveButtonExample {
    colors = KbqComponentColors;
}
