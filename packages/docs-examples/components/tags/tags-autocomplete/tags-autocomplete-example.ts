import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KbqAutocomplete, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqTag, KbqTagInput, KbqTagInputEvent, KbqTagList } from '@koobiq/components/tags';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @title Basic tags autocomplete
 */
@Component({
    selector: 'tags-autocomplete-example',
    templateUrl: 'tags-autocomplete-example.html',
    styleUrls: ['tags-autocomplete-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TagsAutocompleteExample {
    allTags: string[] = ['Первый', 'Второй', 'Третий', 'Четвертый', 'Пятый', 'Шестой'];
    selectedTags: string[] = [];

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
