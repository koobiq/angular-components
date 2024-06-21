import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KbqAutocomplete, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqTag, KbqTagInput, KbqTagInputEvent, KbqTagList } from '@koobiq/components/tags';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @title Tag Autocomplete Option Operations
 */
@Component({
    selector: 'tag-autocomplete-option-operations-example',
    templateUrl: 'tag-autocomplete-option-operations-example.html',
    styleUrls: ['tag-autocomplete-option-operations-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TagAutocompleteOptionOperationsExample {
    allTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'];
    selectedTags: string[] = ['tag1'];

    @ViewChild('tagList', { static: false }) tagList: KbqTagList;
    @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('tagInput', {read: KbqTagInput, static: false}) tagInputDirective: KbqTagInput;
    @ViewChild('autocomplete', { static: false }) autocomplete: KbqAutocomplete;

    control = new FormControl();

    filteredTags: Observable<string[]>;
    hasDuplicates: boolean = false;

    readonly kbqOptionTagName = 'KBQ-OPTION';

    get canCreate(): boolean {
        const cleanedValue: string = (this.control.value || '').trim();

        return !!cleanedValue && [...new Set(this.allTags.concat(this.selectedTags))]
            .every((tag) => tag !== cleanedValue);
    }

    ngAfterViewInit(): void {
        this.filteredTags = merge(
            this.tagList.tagChanges.asObservable()
                .pipe(map((selectedTags: KbqTag[]) => {
                    const values = selectedTags.map((tag: any) => tag.value);

                    return this.allTags.filter((tag) => !values.includes(tag));
                })),
            this.control.valueChanges.pipe(map(this.onControlValueChanges))
        );
    }

    onCreate({ input, value }: KbqTagInputEvent): void {
        this.control.setValue(value);
        const cleanedValue = (value || '').trim();

        if (cleanedValue) {
            const isOptionSelected = this.autocomplete.options.some((option) => option.selected);
            if (!isOptionSelected && this.canCreate) {
                this.selectedTags.push(cleanedValue);

                // Reset the input value
                if (input) {
                    input.value = '';
                }

                this.control.setValue(null);

                return;
            }
        }

        // save input value on paste event to continue editing
        if (!this.canCreate) {
            input.value = cleanedValue;
            this.control.setValue(cleanedValue);
        }
    }

    onSelect({ option }: KbqAutocompleteSelectedEvent): void {
        option.deselect();

        if (option.value.new) {
            this.selectedTags.push(option.value.value);
        } else {
            this.selectedTags.push(option.value);
        }
        this.control.setValue(null);
        this.tagInput.nativeElement.value = '';
    }

    onRemove(tag: any): void {
        const index = this.selectedTags.indexOf(tag);

        if (index >= 0) {
            this.selectedTags.splice(index, 1);
        }
    }

    addOnBlurFunc(event: FocusEvent) {
        const target: HTMLElement = event.relatedTarget as HTMLElement;

        if (!target || target.tagName !== this.kbqOptionTagName) {
            const kbqTagEvent: KbqTagInputEvent = {
                input: this.tagInput.nativeElement,
                value : this.tagInput.nativeElement.value
            };

            this.onCreate(kbqTagEvent);
        }
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return [...new Set(this.allTags.concat(this.selectedTags))]
            .filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
    }

    private onControlValueChanges = (value: any) => {
        const typedText = ((value?.new) ? value.value : value)?.trim();
        const filteredTagsByInput =  typedText ? this.filter(typedText) : this.allTags.slice();

        const inputAndSelectionTagsDiff = filteredTagsByInput
            .filter((tag) => !this.selectedTags.includes(tag));

        // check for scenario where duplicate exists but also can create/select other tags
        this.hasDuplicates = !inputAndSelectionTagsDiff.length && this.tagInputDirective.hasDuplicates;

        return inputAndSelectionTagsDiff;
    }
}
