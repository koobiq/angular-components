import { AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocomplete, KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTag, KbqTagInput, KbqTagInputEvent, KbqTagList, KbqTagsModule } from '@koobiq/components/tags';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @title Tag autocomplete
 */
@Component({
    standalone: true,
    selector: 'tag-autocomplete-example',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqTagsModule,
        KbqAutocompleteModule,
        ReactiveFormsModule,
        KbqInputModule,
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
export class TagAutocompleteExample implements AfterViewInit {
    allTags: string[] = ['Первый', 'Второй', 'Третий', 'Четвертый', 'Пятый', 'Шестой'];
    selectedTags: string[] = [];

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
                value: this.tagInput.nativeElement.value
            };

            this.onCreate(kbqTagEvent);
        }
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return [...new Set(this.allTags.concat(this.selectedTags))].filter(
            (tag) => tag.toLowerCase().indexOf(filterValue) === 0
        );
    }

    private onControlValueChanges = (value: any) => {
        const typedText = (value?.new ? value.value : value)?.trim();
        const filteredTagsByInput = typedText ? this.filter(typedText) : this.allTags.slice();

        const inputAndSelectionTagsDiff = filteredTagsByInput.filter((tag) => !this.selectedTags.includes(tag));

        // check for scenario where duplicate exists but also can create/select other tags
        this.hasDuplicates = !inputAndSelectionTagsDiff.length && this.tagInputDirective.hasDuplicates;

        return inputAndSelectionTagsDiff;
    };
}
