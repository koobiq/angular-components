import { Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag hug content
 */
@Component({
    standalone: true,
    selector: 'tag-hug-content-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    template: `
        <kbq-tag [color]="colors.Theme">
            Выбранное значение
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
    `
})
export class TagHugContentExample {
    colors = KbqComponentColors;
}
