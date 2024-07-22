import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@koobiq/cdk/keycodes';
import { KBQ_TAGS_DEFAULT_OPTIONS, KbqTagInputEvent, KbqTagsDefaultOptions } from '@koobiq/components/tags';

/**
 * @title Tags Input Onpaste Off
 */
@Component({
    selector: 'tags-input-onpaste-off-example',
    templateUrl: 'tags-input-onpaste-off-example.html',
    styleUrls: ['tags-input-onpaste-off-example.css'],
    // turn off tag add on paste with InjectionToken
    providers: [
        {
            provide: KBQ_TAGS_DEFAULT_OPTIONS,
            // tslint:disable-next-line: no-object-literal-type-assertion
            useValue: { separatorKeyCodes: [ENTER], addOnPaste: false } as KbqTagsDefaultOptions
        }
    ]
})
export class TagsInputOnpasteOffExample {
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
