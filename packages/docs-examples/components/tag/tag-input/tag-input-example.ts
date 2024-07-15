import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@koobiq/cdk/keycodes';
import { KbqTagInputEvent } from '@koobiq/components/tags';

/**
 * @title Basic tag input
 */
@Component({
    selector: 'tag-input-example',
    templateUrl: 'tag-input-example.html',
    styleUrls: ['tag-input-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class TagInputExample {
    control = new FormControl();

    tags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    onCreate(event: KbqTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.tags.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    onRemoveTag(tag: string): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    onClear(): void {
        this.tags.length = 0;
    }
}
