import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagInput, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

const customMaxLengthValidator = (max: number): ValidatorFn => {
    return ({ value }: AbstractControl): ValidationErrors | null => {
        if (!value) {
            return null;
        }

        return value.length <= max ? null : { customMaxLengthValidator: true };
    };
};

/** @title Tag input with form control validators. */
@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqTagsModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    selector: 'tag-input-with-form-control-validators-example',
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" [formControl]="formControl">
                @for (tag of formControl.value; track $index) {
                    <kbq-tag [value]="tag" (removed)="removeTag(tag)">
                        {{ tag }}
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove (click)="remove()"></i>
                    </kbq-tag>
                }

                <input
                    autocomplete="off"
                    kbqInput
                    placeholder="New keyword..."
                    [kbqTagInputFor]="tagList"
                    (kbqTagInputTokenEnd)="createTag($event)"
                />
            </kbq-tag-list>

            <kbq-error>
                @if (formControl.hasError('required')) {
                    Field is required
                }

                @if (formControl.hasError('customMaxLengthValidator')) {
                    Max keywords count is 3
                }
            </kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputWithFormControlValidatorsExample {
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });
    protected readonly formControl = new FormControl(
        ['Koobiq', 'Angular', 'Design'],
        [Validators.required, customMaxLengthValidator(3)]
    );

    protected removeTag(tag: string): void {
        const tags = this.formControl.value || [];
        const index = tags.indexOf(tag);

        if (index >= 0) {
            tags.splice(index, 1);
            this.formControl.setValue(tags);
        }
    }

    protected createTag({ value, input }: KbqTagInputEvent): void {
        if (value) {
            const tags = this.formControl.value || [];

            tags.push(value);
            this.formControl.setValue(tags);
        }

        input.value = '';
    }

    protected remove(): void {
        this.input().nativeElement.focus();
    }
}
