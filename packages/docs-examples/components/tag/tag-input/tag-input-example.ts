import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { COMMA, ENTER } from '@koobiq/cdk/keycodes';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag input
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tag-input-example',
    imports: [
        KbqFormFieldModule,
        KbqTagsModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList>
                @for (tag of tags; track tag) {
                    <kbq-tag [value]="tag" (removed)="onRemoveTag(tag)">
                        {{ tag }}
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    placeholder="New tag..."
                    [formControl]="control"
                    [kbqTagInputFor]="tagList"
                    [kbqTagInputSeparatorKeyCodes]="separatorKeysCodes"
                    (kbqTagInputTokenEnd)="onCreate($event)"
                />

                <kbq-cleaner #kbqTagListCleaner (click)="onClear()" />
            </kbq-tag-list>
        </kbq-form-field>
    `
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
