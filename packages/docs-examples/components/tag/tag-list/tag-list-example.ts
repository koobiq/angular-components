import { Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag list
 */
@Component({
    standalone: true,
    selector: 'tag-list-example',
    imports: [
        KbqTagsModule,
        KbqIconModule
    ],
    template: `
        <kbq-tag-list>
            @for (tag of simpleTags; track tag) {
                <kbq-tag [value]="tag" (removed)="onRemoveTag(tag)">
                    {{ tag }}
                    <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>
            }
        </kbq-tag-list>
    `
})
export class TagListExample {
    simpleTags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    onRemoveTag(tag: string): void {
        const index = this.simpleTags.indexOf(tag);

        if (index >= 0) {
            this.simpleTags.splice(index, 1);
        }
    }
}
