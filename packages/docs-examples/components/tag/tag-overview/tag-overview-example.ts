import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tag-overview-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    template: `
        <kbq-tag [color]="colors.ContrastFade">
            Tag
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
    `
})
export class TagOverviewExample {
    colors = KbqComponentColors;
}
