import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

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
            <kbq-tag-list #inputTagList [formControl]="formControl">
                @for (tag of formControl.value; track tag) {
                    <kbq-tag [value]="tag" (removed)="removeTag(tag)">
                        {{ tag }}
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    [kbqTagInputFor]="inputTagList"
                    (kbqTagInputTokenEnd)="createTag($event)"
                    kbqInput
                    placeholder="New keyword..."
                />
            </kbq-tag-list>

            @if (formControl.invalid) {
                <kbq-hint color="error">
                    @if (formControl.hasError('required')) {
                        Field is required
                    }

                    @if (formControl.hasError('customMaxLengthValidator')) {
                        Max keywords count is 3
                    }
                </kbq-hint>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputWithFormControlValidatorsExample {
    readonly formControl = new FormControl(
        ['Koobiq', 'Angular', 'Design'],
        [Validators.required, customMaxLengthValidator(3)]
    );

    removeTag(tag: string): void {
        const tags = this.formControl.value || [];
        const index = tags.indexOf(tag);

        if (index >= 0) {
            tags.splice(index, 1);
            this.formControl.setValue(tags);
        }
    }

    createTag({ value, input }: KbqTagInputEvent): void {
        if (value) {
            const tags = this.formControl.value || [];

            tags.push(value);
            this.formControl.setValue(tags);
        }

        input.value = '';
    }
}
