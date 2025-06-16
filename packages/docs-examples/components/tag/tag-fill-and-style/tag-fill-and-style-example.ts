import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag fill and style
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tag-fill-and-style-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    host: {
        class: 'layout-row layout-wrap layout-gap-l layout-margin-5xl layout-align-center-center'
    },
    template: `
        <kbq-tag [color]="colors.ContrastFade">
            <i kbq-icon="kbq-check-circle_16"></i>
            Contrast
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
        <kbq-tag [color]="colors.Theme">
            <i kbq-icon="kbq-check-circle_16"></i>
            Theme
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
        <kbq-tag [color]="colors.Error">
            <i kbq-icon="kbq-check-circle_16"></i>
            Error
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
        <kbq-tag [color]="colors.Warning">
            <i kbq-icon="kbq-check-circle_16"></i>
            Warning
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
    `
})
export class TagFillAndStyleExample {
    colors = KbqComponentColors;
}
