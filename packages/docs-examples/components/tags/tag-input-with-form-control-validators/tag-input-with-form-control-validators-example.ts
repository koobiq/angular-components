import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagInput, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

const MAX_TAG_COUNT = 5;
const LATIN_PATTERN = /^[a-zA-Z]+$/;

/** Validates the number of tags — the control value is the whole tag array. */
const maxTagCountValidator = (max: number): ValidatorFn => {
    return ({ value }: AbstractControl<string[] | null>): ValidationErrors | null => {
        return !value || value.length <= max ? null : { maxTagCount: { max } };
    };
};

/** Validates every tag separately, reporting the offending ones back to the template. */
const latinValidator = (): ValidatorFn => {
    return ({ value }: AbstractControl<string[] | null>): ValidationErrors | null => {
        const invalidTags = (value || []).filter((tag) => !LATIN_PATTERN.test(tag));

        return invalidTags.length ? { latin: { invalidTags } } : null;
    };
};

/** @title Tag input with form control validators */
@Component({
    selector: 'tag-input-with-form-control-validators-example',
    imports: [
        KbqInputModule,
        KbqTagsModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" [formControl]="formControl">
                @for (tag of formControl.value; track $index) {
                    <kbq-tag [value]="tag" (removed)="removeTag(tag)">
                        {{ tag }}
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove (click)="afterRemove()"></i>
                    </kbq-tag>
                }

                <input
                    autocomplete="off"
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    (kbqTagInputTokenEnd)="createTag($event)"
                />

                <kbq-cleaner (click)="clear()" />
            </kbq-tag-list>

            <kbq-hint>Only latin letters, up to {{ maxTagCount }} tags</kbq-hint>

            <kbq-error>
                @if (formControl.hasError('required')) {
                    Field is required
                } @else if (formControl.getError('maxTagCount'); as error) {
                    No more than {{ error.max }} tags
                } @else if (formControl.getError('latin'); as error) {
                    Invalid tags: {{ error.invalidTags.join(', ') }}
                }
            </kbq-error>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
            min-height: var(--kbq-size-xxl);
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputWithFormControlValidatorsExample {
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });
    protected readonly maxTagCount = MAX_TAG_COUNT;
    protected readonly formControl = new FormControl<string[]>(
        ['Koobiq', 'Angular', 'Design'],
        [Validators.required, maxTagCountValidator(MAX_TAG_COUNT), latinValidator()]
    );

    protected removeTag(tag: string): void {
        const tags = [...(this.formControl.value || [])];
        const index = tags.indexOf(tag);

        if (index >= 0) {
            tags.splice(index, 1);
            this.formControl.setValue(tags);
        }
    }

    protected createTag({ value, input }: KbqTagInputEvent): void {
        if (value) {
            this.formControl.setValue([...(this.formControl.value || []), value]);
        }

        input.value = '';
    }

    protected afterRemove(): void {
        this.input().nativeElement.focus();
    }

    protected clear(): void {
        this.formControl.setValue([]);
    }
}
