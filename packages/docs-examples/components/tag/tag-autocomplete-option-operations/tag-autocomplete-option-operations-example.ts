import { AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocomplete, KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTag, KbqTagInput, KbqTagInputEvent, KbqTagList, KbqTagsModule } from '@koobiq/components/tags';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

const autocompleteValueCoercion = (value): string => (value?.new ? value.value : value) || '';

/**
 * @title Tag autocomplete option operations
 */
@Component({
    standalone: true,
    selector: 'tag-autocomplete-option-operations-example',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqTagsModule,
        ReactiveFormsModule,
        KbqAutocompleteModule,
        KbqIconModule,
        AsyncPipe
    ],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList>
                @for (tag of selectedTags; track tag) {
                    <kbq-tag [value]="tag" (removed)="onRemove(tag)">
                        {{ tag }}
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }
                <input
                    #tagInput
                    [distinct]="true"
                    [formControl]="control"
                    [kbqAutocomplete]="autocomplete"
                    [kbqTagInputAddOnBlur]="false"
                    [kbqTagInputFor]="tagList"
                    [kbqTagInputSeparatorKeyCodes]="[]"
                    (blur)="addOnBlurFunc($event)"
                    (kbqTagInputTokenEnd)="onCreate($event)"
                    placeholder="Placeholder"
                />
            </kbq-tag-list>
            <kbq-autocomplete #autocomplete (optionSelected)="onSelect($event)">
                @if (canCreate) {
                    <kbq-option [value]="{ new: true, value: tagInput.value }">
                        Создать: {{ tagInput.value }}
                    </kbq-option>
                }
                @if (hasDuplicates) {
                    <kbq-option [disabled]="true">Ничего не найдено</kbq-option>
                }
                @for (tag of filteredTags | async; track tag) {
                    <kbq-option [value]="tag">
                        {{ tag }}
                    </kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `
})
export class TagAutocompleteOptionOperationsExample implements AfterViewInit {
    allTags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'];
    selectedTags: string[] = ['tag1'];

    @ViewChild('tagList', { static: false }) tagList: KbqTagList;
    @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('tagInput', { read: KbqTagInput, static: false }) tagInputDirective: KbqTagInput;
    @ViewChild('autocomplete', { static: false }) autocomplete: KbqAutocomplete;

    control = new FormControl();

    filteredTags: Observable<string[]>;
    hasDuplicates: boolean = false;

    readonly kbqOptionTagName = 'KBQ-OPTION';

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
            this.control.valueChanges.pipe(map((e) => this.onControlValueChanges(e)))
        );
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
                value: this.tagInput.nativeElement.value
            };

            this.onCreate(kbqTagEvent);
        }
    }

    private filter(value: string): string[] {
        // Convert the input value to lowercase for case-insensitive comparison
        const filterValue = value.toLowerCase();

        // Combine all tags and selected tags into a single array, removing duplicates
        const uniqueTags = [...new Set(this.allTags.concat(this.selectedTags))];

        return uniqueTags.filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
    }

    private onControlValueChanges = (value: string | null) => {
        const typedText: string | undefined = autocompleteValueCoercion(value)?.trim();
        const filteredTagsByInput = typedText ? this.filter(typedText) : this.allTags.slice();

        const inputAndSelectionTagsDiff = filteredTagsByInput.filter((tag) => !this.selectedTags.includes(tag));

        // check for scenario where duplicate exists but also can create/select other tags
        this.hasDuplicates = !inputAndSelectionTagsDiff.length && this.tagInputDirective.hasDuplicates;

        return inputAndSelectionTagsDiff;
    };
}
