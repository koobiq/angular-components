import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@koobiq/cdk/keycodes';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Validation tag list
 */
@Component({
    selector: 'validation-tag-list-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqToolTipModule,
        KbqButtonModule,
        KbqIcon,
        KbqTagsModule
    ],
    template: `
        <form
            novalidate
            style="width: 320px"
            [formGroup]="reactiveForm"
            (ngSubmit)="onSubmitReactiveForm(reactiveForm)"
        >
            <kbq-form-field class="layout-margin-bottom-l">
                <kbq-tag-list #inputTagList formControlName="reactiveTypeaheadValue" [emitOnTagChanges]="false">
                    @for (tag of reactiveForm.controls['reactiveTypeaheadValue'].value; track tag) {
                        <kbq-tag [value]="tag" (removed)="reactiveInputOnRemoveTag(tag)">
                            {{ tag }}
                            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                        </kbq-tag>
                    }
                    <input
                        formControlName="tagInputFormControl"
                        placeholder="New tag..."
                        [kbqTagInputFor]="inputTagList"
                        [kbqTagInputSeparatorKeyCodes]="separatorKeysCodes"
                        (kbqTagInputTokenEnd)="reactiveInputOnCreate($event)"
                    />
                </kbq-tag-list>

                @if (inputTagList.errorState) {
                    <kbq-error>Required</kbq-error>
                }

                <kbq-hint>Provide only latin letters</kbq-hint>
            </kbq-form-field>

            <button type="submit" kbq-button>Submit</button>
        </form>
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationTagListExample implements OnInit {
    protected readonly reactiveForm: FormGroup;
    protected readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    private readonly formBuilder = inject(FormBuilder);

    constructor() {
        this.reactiveForm = this.formBuilder.group({
            reactiveTypeaheadValue: this.formBuilder.control([], Validators.required),
            tagInputFormControl: this.formBuilder.control('', [Validators.pattern('[a-zA-Z]*')])
        });
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.reactiveForm.controls['reactiveTypeaheadValue'].setValue(['asd', 'efd']);
        });
    }

    reactiveInputOnCreate({ input, value }: KbqTagInputEvent): void {
        const control = this.reactiveForm.controls.reactiveTypeaheadValue;
        const updatedControlValue: string[] = control.value.slice();

        if ((value || '').trim()) {
            updatedControlValue.push(value.trim());
            control.patchValue(updatedControlValue);
            control.markAsDirty();
        }

        if (input) {
            input.value = '';
        }
    }

    reactiveInputOnRemoveTag(tag: string): void {
        const control = this.reactiveForm.controls['reactiveTypeaheadValue'];
        const controlValue: string[] = control.value.slice();
        const index = controlValue.indexOf(tag);

        if (index >= 0) {
            controlValue.splice(index, 1);
            control.patchValue(controlValue);
            control.markAsDirty();
        }
    }

    onSubmitReactiveForm(form: FormGroup) {
        console.log('onSubmitReactiveForm: ', form);
    }
}
