import { AsyncPipe } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { COMMA, ENTER, SPACE, TAB } from '@koobiq/cdk/keycodes';
import { KbqAutocomplete, KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqComponentColors, kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    KBQ_TAGS_DEFAULT_OPTIONS,
    KbqTag,
    KbqTagInput,
    KbqTagInputEvent,
    KbqTagList,
    KbqTagsDefaultOptions,
    KbqTagsModule
} from '@koobiq/components/tags';
import { KbqTitleModule } from '@koobiq/components/title';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TagExamplesModule } from '../../docs-examples/components/tag';

const customMaxLengthValidator = (max: number): ValidatorFn => {
    return ({ value }: AbstractControl): ValidationErrors | null => {
        if (!value) {
            return null;
        }

        return value.length <= max ? null : { customMaxLengthValidator: true };
    };
};

@Component({
    standalone: true,
    imports: [TagExamplesModule],
    selector: 'dev-examples',
    template: `
        <tag-autocomplete-option-operations-example />
        <hr />
        <tag-input-example />
        <hr />
        <tag-autocomplete-example />
        <hr />
        <tag-overview-example />
        <hr />
        <tag-fill-and-style-example />
        <hr />
        <tag-disabled-example />
        <hr />
        <tag-with-icon-example />
        <hr />
        <tag-with-remove-button-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DevExamples {}

@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqTagsModule,
        ReactiveFormsModule,
        KbqIconModule
    ],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    selector: 'dev-tag-input-validation',
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
                    kbqInput
                    placeholder="New keyword..."
                    [kbqTagInputFor]="inputTagList"
                    (kbqTagInputTokenEnd)="createTag($event)"
                />
            </kbq-tag-list>

            @if (formControl.invalid) {
                <kbq-error>
                    @if (formControl.hasError('required')) {
                        Field is required
                    }

                    @if (formControl.hasError('customMaxLengthValidator')) {
                        Max keywords count is 3
                    }
                </kbq-error>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevTagInputValidation {
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

@Component({
    standalone: true,
    imports: [
        FormsModule,
        KbqFormFieldModule,
        ReactiveFormsModule,
        KbqAutocompleteModule,
        KbqTagsModule,
        KbqIconModule,
        KbqTitleModule,
        DevExamples,
        AsyncPipe
    ],
    providers: [
        {
            provide: KBQ_TAGS_DEFAULT_OPTIONS,
            useValue: { separatorKeyCodes: [ENTER], addOnPaste: false } satisfies KbqTagsDefaultOptions
        }
    ],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp implements AfterViewInit {
    colors = KbqComponentColors;

    addOnBlur = false;
    visible = true;
    tagCtrl = new UntypedFormControl();

    simpleTags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    inputTags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    enterTags = ['tag', 'tag1', 'tag2', 'tag3', 'tag4'];

    autocompleteAllTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'];
    autocompleteSelectedTags: string[] = ['tag1'];
    autocompleteFilteredTagsByInput: string[] = [];
    autocompleteFilteredTags: Observable<string[]>;

    readonly optionTagName = 'KBQ-OPTION';

    readonly separatorKeysCodes: number[] = [ENTER, SPACE, TAB, COMMA];

    @ViewChild('inputTagInput', { static: false }) inputTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('inputTagList', { static: false }) inputTagList: KbqTagList;

    @ViewChild('autocompleteTagInput', { static: false }) autocompleteTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('autocompleteTagInput', { read: KbqTagInput, static: false }) autoCompleteTagInputRef: KbqTagInput;
    @ViewChild('autocompleteTagList', { static: false }) autocompleteTagList: KbqTagList;
    @ViewChild('autocomplete', { static: false }) autocomplete: KbqAutocomplete;

    @ViewChild('enterTagInput', { static: false }) enterTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('enterInputTagList', { static: false }) enterInputTagList: KbqTagList;
    hasDuplicates: boolean;

    get canCreate(): boolean {
        const cleanedValue = (this.tagCtrl.value || '').trim();

        return (
            cleanedValue &&
            [...new Set(this.autocompleteAllTags.concat(this.autocompleteSelectedTags))].every(
                (tag) => tag !== cleanedValue
            )
        );
    }

    ngAfterViewInit(): void {
        this.autocompleteFilteredTags = merge(
            this.autocompleteTagList.tagChanges.asObservable().pipe(
                map((selectedTags: KbqTag[]) => {
                    const values = selectedTags.map((tag) => tag.value);

                    return this.autocompleteAllTags.filter((tag) => !values.includes(tag));
                })
            ),
            this.tagCtrl.valueChanges.pipe(
                map((value: any) => {
                    const typedText = (value?.new ? value.value : value)?.trim();

                    this.autocompleteFilteredTagsByInput = typedText
                        ? this.filter(typedText)
                        : this.autocompleteAllTags.slice();

                    const inputAndSelectionTagsDiff = this.autocompleteFilteredTagsByInput.filter(
                        (tag) => !this.autocompleteSelectedTags.includes(tag)
                    );

                    // check for scenario where duplicate exists but also can create/select other tags
                    this.hasDuplicates =
                        !inputAndSelectionTagsDiff.length && this.autoCompleteTagInputRef.hasDuplicates;

                    return inputAndSelectionTagsDiff;
                })
            )
        );
    }

    inputOnCreate(event: KbqTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if (value) {
            this.inputTags.push(value);

            input.value = '';
        }
    }

    enterOnCreate(event: KbqTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.enterTags.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    autocompleteOnCreate({ input, value }: KbqTagInputEvent): void {
        this.tagCtrl.setValue(value);
        const cleanedValue = (value || '').trim();

        if (cleanedValue) {
            const isOptionSelected = this.autocomplete.options.some((option) => option.selected);

            if (!isOptionSelected && this.canCreate) {
                this.autocompleteSelectedTags.push(cleanedValue);

                // Reset the input value
                if (input) {
                    input.value = '';
                }

                this.tagCtrl.setValue(null);

                return;
            }
        }

        if (!this.canCreate) {
            input.value = cleanedValue;
            this.tagCtrl.setValue(cleanedValue);
        }
    }

    addOnBlurFunc(event: FocusEvent) {
        const target: HTMLElement = event.relatedTarget as HTMLElement;

        if (!target || target.tagName !== this.optionTagName) {
            const kbqTagEvent: KbqTagInputEvent = {
                input: this.autocompleteTagInput.nativeElement,
                value: this.autocompleteTagInput.nativeElement.value
            };

            this.autocompleteOnCreate(kbqTagEvent);
        }
    }

    autocompleteOnSelect({ option }: KbqAutocompleteSelectedEvent): void {
        option.deselect();

        if (option.value.new) {
            this.autocompleteSelectedTags.push(option.value.value);
        } else {
            this.autocompleteSelectedTags.push(option.value);
        }

        this.autocompleteTagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    autocompleteOnRemove(fruit: any): void {
        const index = this.autocompleteSelectedTags.indexOf(fruit);

        if (index >= 0) {
            this.autocompleteSelectedTags.splice(index, 1);
        }
    }

    onRemoveTag(tag: string): void {
        const index = this.simpleTags.indexOf(tag);

        if (index >= 0) {
            this.simpleTags.splice(index, 1);
        }
    }

    inputOnRemoveTag(tag: string): void {
        const index = this.inputTags.indexOf(tag);

        if (index >= 0) {
            this.inputTags.splice(index, 1);
        }
    }

    enterOnRemoveTag(tag: string): void {
        const index = this.enterTags.indexOf(tag);

        if (index >= 0) {
            this.enterTags.splice(index, 1);
        }
    }

    private filter(value: string): string[] {
        const filterValue = value ? value.toLowerCase() : '';

        return [...new Set(this.autocompleteAllTags.concat(this.autocompleteSelectedTags))].filter(
            (tag) => tag.toLowerCase().indexOf(filterValue) === 0
        );
    }
}
