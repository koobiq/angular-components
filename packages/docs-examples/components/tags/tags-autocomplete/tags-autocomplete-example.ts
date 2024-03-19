import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KbqAutocomplete, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqTagInputEvent, KbqTagList } from '@koobiq/components/tags';
import { merge } from 'rxjs';
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
    @ViewChild('tagList', { static: false }) tagList: KbqTagList;
    @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('autocomplete', { static: false }) autocomplete: KbqAutocomplete;

    control = new FormControl();

    allTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'];
    filteredTagsByInput: string[] = [];
    selectedTags: string[] = ['tag1'];

    filteredTags: any;

    ngAfterViewInit(): void {
        this.filteredTags = merge(
            this.tagList.tagChanges.asObservable()
                .pipe(map((selectedTags) => {
                    const values = selectedTags.map((tag: any) => tag.value);

                    return this.allTags.filter((tag) => !values.includes(tag));
                })),
            this.control.valueChanges
                .pipe(map((value) => {
                    const typedText = (value && value.new) ? value.value : value;

                    this.filteredTagsByInput = typedText ?
                        this.filter(typedText) : this.allTags.slice();

                    return this.filteredTagsByInput
                        .filter((tag) => !this.selectedTags.includes(tag));
                }))
        );
    }

    addOnBlurFunc(event: FocusEvent) {
        const target: HTMLElement = event.relatedTarget as HTMLElement;

        if (!target || target.tagName !== 'kbq-OPTION') {
            const kbqTagEvent: KbqTagInputEvent = {
                input: this.tagInput.nativeElement,
                value : this.tagInput.nativeElement.value
            };

            this.onCreate(kbqTagEvent);
        }
    }

    onCreate(event: KbqTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            const isOptionSelected = this.autocomplete.options.some((option) => option.selected);
            if (!isOptionSelected) {
                this.selectedTags.push(value.trim());
            }
        }

        if (input) {
            input.value = '';
        }

        this.control.setValue(null);
    }

    onSelect(event: KbqAutocompleteSelectedEvent): void {
        event.option.deselect();

        if (event.option.value.new) {
            this.selectedTags.push(event.option.value.value);
        } else {
            this.selectedTags.push(event.option.value);
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

        return this.allTags.filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
    }
}
