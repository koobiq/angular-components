import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Basic tag list
 */
@Component({
    selector: 'tag-list-example',
    templateUrl: 'tag-list-example.html',
    styleUrls: ['tag-list-example.css'],
    encapsulation: ViewEncapsulation.None
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
