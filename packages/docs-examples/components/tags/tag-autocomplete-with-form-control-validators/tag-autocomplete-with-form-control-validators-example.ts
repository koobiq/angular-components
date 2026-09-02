import { ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormControl,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagInput, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

const MAX_TAG_COUNT = 5;
const LATIN_PATTERN = /^[a-zA-Z]+$/;
const OPTIONS = ['Phishing', 'Ransomware', 'Spyware', 'Вирус', 'Trojan', 'Botnet', 'Rootkit', 'Keylogger'];

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

/** @title Tag autocomplete with form control validators. */
@Component({
    selector: 'tag-autocomplete-with-form-control-validators-example',
    imports: [
        ReactiveFormsModule,
        KbqTagsModule,
        KbqAutocompleteModule,
        KbqIconModule,
        KbqInputModule,
        KbqHighlightBackgroundPipe
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
                    #input
                    autocomplete="off"
                    kbqInput
                    placeholder="New tag"
                    [kbqAutocomplete]="autocomplete"
                    [kbqTagInputFor]="tagList"
                    (input)="query.set(input.value)"
                    (kbqTagInputTokenEnd)="createTag($event)"
                />

                <kbq-cleaner (click)="clear()" />
            </kbq-tag-list>

            <kbq-autocomplete #autocomplete="kbqAutocomplete" (optionSelected)="selected($event, input)">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option | kbqHighlightBackground: query().trim()"></span>
                    </kbq-option>
                }
            </kbq-autocomplete>

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
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagAutocompleteWithFormControlValidatorsExample {
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });

    protected readonly maxTagCount = MAX_TAG_COUNT;
    protected readonly query = signal('');
    protected readonly formControl = new FormControl<string[]>(OPTIONS.slice(0, 3), [
        Validators.required,
        maxTagCountValidator(MAX_TAG_COUNT),
        latinValidator()
    ]);

    /** The control value as a signal, so the option list can be derived from it. */
    private readonly tags = toSignal(this.formControl.valueChanges, { initialValue: this.formControl.value });

    protected readonly filteredOptions = computed(() => {
        const current = this.query().trim().toLowerCase();
        const options = OPTIONS.filter((option) => !this.tags()?.includes(option));

        return current ? options.filter((option) => option.toLowerCase().includes(current)) : options;
    });

    protected createTag({ value, input }: KbqTagInputEvent): void {
        if (value) {
            this.addTag(value);
        }

        this.resetInput(input);
    }

    protected selected({ option }: KbqAutocompleteSelectedEvent, input: HTMLInputElement): void {
        this.addTag(option.value);
        this.resetInput(input);
        option.deselect();
    }

    protected removeTag(tag: string): void {
        const tags = this.formControl.value || [];
        const index = tags.indexOf(tag);

        if (index >= 0) {
            tags.splice(index, 1);
            this.formControl.setValue(tags);
        }
    }

    protected clear(): void {
        this.formControl.setValue([]);
    }

    protected afterRemove(): void {
        this.input().nativeElement.focus();
    }

    private addTag(tag: string): void {
        this.formControl.setValue([...(this.formControl.value || []), tag]);
    }

    private resetInput(input: HTMLInputElement): void {
        input.value = '';
        this.query.set('');
    }
}
