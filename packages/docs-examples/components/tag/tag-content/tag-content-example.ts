import { Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag content
 */
@Component({
    standalone: true,
    selector: 'tag-content-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    styles: `
        .content__example-tags-group {
            display: inline-flex;
            flex-direction: column;
            gap: 32px;
            max-width: 504px;
        }

        .content__example-tags-group .example-tag {
            width: 96px;
        }

        .content__example-tags-group .content__example-tag-row {
            gap: 24px;
        }
    `,
    template: `
        <div class="kbq-text-big layout-wrap content__example-tags-group">
            <div class="layout-row layout-wrap content__example-tag-row">
                <div class="example-tag">
                    <div class="layout-margin-bottom-l kbq-form__label">Text</div>
                    <kbq-tag [color]="colors.Theme">Tag</kbq-tag>
                </div>
                <div class="example-tag">
                    <div class="layout-margin-bottom-l kbq-form__label">Icon+Text</div>
                    <kbq-tag [color]="colors.Theme">
                        <i kbq-icon="kbq-check-circle_16"></i>
                        Tag
                    </kbq-tag>
                </div>
                <div class="example-tag">
                    <div class="layout-margin-bottom-l kbq-form__label">Text+Close</div>
                    <kbq-tag [color]="colors.Theme">
                        Tag
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                </div>
                <div class="example-tag">
                    <div class="layout-margin-bottom-l kbq-form__label">Icon+Text+Close</div>
                    <kbq-tag [color]="colors.Theme">
                        <i kbq-icon="kbq-check-circle_16"></i>
                        Tag
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                </div>
            </div>
        </div>
    `
})
export class TagContentExample {
    colors = KbqComponentColors;
}
