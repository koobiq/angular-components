import { Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag fill and style
 */
@Component({
    standalone: true,
    selector: 'tag-fill-and-style-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    styles: `
        .fill-and-style__example-tags-group {
            display: inline-flex;
            flex-direction: column;
            gap: 32px;
            max-width: 504px;
        }

        .fill-and-style__example-tags-group .example-tag {
            width: 96px;
        }

        .fill-and-style__example-tags-group .fill-and-style__example-tag-row {
            gap: 24px;
        }
    `,
    template: `
        <div class="kbq-body layout-wrap fill-and-style__example-tags-group">
            <div class="layout-row layout-wrap fill-and-style__example-tag-row">
                <div class="example-tag">
                    <div class="layout-margin-bottom-l kbq-form__label">Fade Theme</div>
                    <kbq-tag [color]="colors.Theme">
                        <i kbq-icon="kbq-check-circle_16"></i>
                        Tag
                    </kbq-tag>
                </div>
                <div class="example-tag">
                    <div class="layout-margin-bottom-l kbq-form__label">Fade Contrast</div>
                    <kbq-tag [color]="colors.ContrastFade">
                        <i kbq-icon="kbq-check-circle_16"></i>
                        Tag
                    </kbq-tag>
                </div>
                <div class="example-tag">
                    <div class="layout-margin-bottom-l kbq-form__label">Fade Error</div>
                    <kbq-tag [color]="colors.Error">
                        <i kbq-icon="kbq-check-circle_16"></i>
                        Tag
                    </kbq-tag>
                </div>
            </div>
        </div>
    `
})
export class TagFillAndStyleExample {
    colors = KbqComponentColors;
}
