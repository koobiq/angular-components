import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { COMMA, ENTER } from '@koobiq/cdk/keycodes';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KBQ_TAGS_DEFAULT_OPTIONS,
    KbqTagInput,
    KbqTagInputEvent,
    KbqTagsDefaultOptions,
    KbqTagsModule
} from '@koobiq/components/tags';

/**
 * @title Tags input onpaste off
 */
@Component({
    selector: 'tags-input-onpaste-off-example',
    imports: [
        KbqTagsModule,
        ReactiveFormsModule,
        KbqIconModule,
        KbqFormFieldModule
    ],
    templateUrl: 'tags-input-onpaste-off-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    // turn off tag add on paste with InjectionToken
    providers: [
        {
            provide: KBQ_TAGS_DEFAULT_OPTIONS,
            useValue: { separatorKeyCodes: [ENTER], addOnPaste: false } as KbqTagsDefaultOptions
        }
    ]
})
export class TagsInputOnpasteOffExample {
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });

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

    protected afterRemove(): void {
        this.input().nativeElement.focus();
    }
}
