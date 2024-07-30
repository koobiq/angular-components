import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqAutocomplete, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import {
    KBQ_TAGS_DEFAULT_OPTIONS,
    KbqTag,
    KbqTagInput,
    KbqTagInputEvent,
    KbqTagList,
    KbqTagsDefaultOptions
} from '@koobiq/components/tags';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @title Tags Autocomplete Onpaste Off
 */
@Component({
    selector: 'tags-autocomplete-onpaste-off-example',
    templateUrl: 'tags-autocomplete-onpaste-off-example.html',
    styleUrls: ['tags-autocomplete-onpaste-off-example.css'],
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

    allTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'];
    filteredTagsByInput: string[] = [];
    selectedTags: string[] = ['tag1'];

    filteredTags: any;
    hasDuplicates: boolean;

    get canCreate(): boolean {
        const cleanedValue: string = (this.control.value || '').trim();

        return (
            !!cleanedValue && [...new Set(this.allTags.concat(this.selectedTags))].every((tag) => tag !== cleanedValue)
        );
    }

    ngAfterViewInit(): void {
        this.filteredTags = merge(
            this.tagList.tagChanges.asObservable().pipe(
                map((selectedTags: KbqTag[]) => {
                    const values = selectedTags.map((tag: any) => tag.value);

                    return this.allTags.filter((tag) => !values.includes(tag));
                })
            ),
            this.control.valueChanges.pipe(
                map((value: any) => {
                    const typedText = (value?.new ? value.value : value)?.trim();

                    this.filteredTagsByInput = typedText ? this.filter(typedText) : this.allTags.slice();

                    const inputAndSelectionTagsDiff = this.filteredTagsByInput.filter(
                        (tag) => !this.selectedTags.includes(tag)
                    );

                    // check for scenario where duplicate exists but also can create/select other tags
                    this.hasDuplicates = !inputAndSelectionTagsDiff.length && this.tagInputDirective.hasDuplicates;

                    return inputAndSelectionTagsDiff;
                })
            )
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
        const filterValue = value.toLowerCase();

        return [...new Set(this.allTags.concat(this.selectedTags))].filter(
            (tag) => tag.toLowerCase().indexOf(filterValue) === 0
        );
    }
}
