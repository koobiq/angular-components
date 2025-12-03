import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqAutocomplete, KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KBQ_TAGS_DEFAULT_OPTIONS,
    KbqTag,
    KbqTagInput,
    KbqTagInputEvent,
    KbqTagList,
    KbqTagsDefaultOptions,
    KbqTagsModule
} from '@koobiq/components/tags';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const autocompleteValueCoercion = (value): string => (value?.new ? value.value : value) || '';

/**
 * @title Tags autocomplete onpaste off
 */
@Component({
    selector: 'tags-autocomplete-onpaste-off-example',
    imports: [
        KbqTagsModule,
        KbqFormFieldModule,
        KbqIconModule,
        ReactiveFormsModule,
        KbqAutocompleteModule,
        AsyncPipe
    ],
    templateUrl: 'tags-autocomplete-onpaste-off-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    // turn off tag add on paste with InjectionToken
    providers: [
        {
            provide: KBQ_TAGS_DEFAULT_OPTIONS,
            useValue: { separatorKeyCodes: [ENTER], addOnPaste: false } as KbqTagsDefaultOptions
        }
    ]
})
export class TagsAutocompleteOnpasteOffExample implements AfterViewInit {
    @ViewChild('tagList', { static: false }) tagList: KbqTagList;
    @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('tagInput', { read: KbqTagInput, static: false }) tagInputDirective: KbqTagInput;
    @ViewChild('autocomplete', { static: false }) autocomplete: KbqAutocomplete;

    control = new FormControl();

    suggestions: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'];
    selectedTags: string[] = ['tag1'];

    filteredTags: Observable<string[]>;
    hasDuplicates: boolean;

    get canCreate(): boolean {
        const cleanedValue: string = (this.control.value || '').trim();

        return (
            !!cleanedValue &&
            [...new Set(this.suggestions.concat(this.selectedTags))].every((tag) => tag !== cleanedValue)
        );
    }

    ngAfterViewInit(): void {
        this.filteredTags = merge(
            this.tagList.tagChanges.asObservable().pipe(
                map((selectedTags: KbqTag[]) => {
                    const values = selectedTags.map((tag: any) => tag.value);

                    return this.suggestions.filter((tag) => !values.includes(tag));
                })
            ),

            this.control.valueChanges.pipe(map((e: string | null) => this.onControlValueChanges(e)))
        );
    }

    addOnBlurFunc(event: FocusEvent) {
        const target: HTMLElement = event.relatedTarget as HTMLElement;

        if (!target || target.tagName !== 'KBQ-OPTION') {
            const mcTagEvent: KbqTagInputEvent = {
                input: this.tagInput.nativeElement,
                value: this.tagInput.nativeElement.value
            };

            this.onCreate(mcTagEvent);
        }
    }

    onCreate({ input, value }: KbqTagInputEvent): void {
        this.control.setValue(value);
        const cleanedValue = (value || '').trim();

        if (cleanedValue && this.canCreate) {
            this.selectedTags.push(cleanedValue);

            // Reset the input value
            if (input) input.value = '';

            this.control.setValue(null);

            return;
        }

        // save input value on paste event to continue editing
        input.value = cleanedValue;
        this.control.setValue(cleanedValue);
    }

    onSelect({ option }: KbqAutocompleteSelectedEvent): void {
        option.deselect();

        this.selectedTags.push(autocompleteValueCoercion(option.value));
        this.tagInput.nativeElement.value = '';
        this.control.setValue(null);
    }

    onRemove(fruit: any): void {
        const index = this.selectedTags.indexOf(fruit);

        if (index >= 0) {
            this.selectedTags.splice(index, 1);
        }
    }

    private filter(value: string): string[] {
        // Convert the input value to lowercase for case-insensitive comparison
        const filterValue = value ? value.toLowerCase() : '';

        // Combine all tags and selected tags into a single array, removing duplicates
        const uniqueTags = [...new Set(this.suggestions.concat(this.selectedTags))];

        return uniqueTags.filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
    }

    private onControlValueChanges = (value: string | null) => {
        const typedText: string | undefined = autocompleteValueCoercion(value)?.trim();
        const filteredTagsByInput = typedText ? this.filter(typedText) : this.suggestions.slice();

        const inputAndSelectionTagsDiff = filteredTagsByInput.filter((tag) => !this.selectedTags.includes(tag));

        // check for scenario where duplicate exists but also can create/select other tags
        this.hasDuplicates = !inputAndSelectionTagsDiff.length && this.tagInputDirective.hasDuplicates;

        // Return the difference between filtered tags and selected tags
        return inputAndSelectionTagsDiff;
    };

    protected afterRemove(): void {
        this.tagInput.nativeElement.focus();
    }
}
