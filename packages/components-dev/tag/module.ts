// tslint:disable:no-console
import {
    AfterViewInit,
    Component,
    ElementRef,
    NgModule,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { COMMA, ENTER, SPACE, TAB } from '@koobiq/cdk/keycodes';
import { KbqAutocomplete, KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagList, KbqTagsModule, KbqTagInputEvent, KbqTag, KbqTagInput } from '@koobiq/components/tags';
import { KbqTitleModule } from '@koobiq/components/title';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements AfterViewInit {
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

    @ViewChild('inputTagInput', {static: false}) inputTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('inputTagList', {static: false}) inputTagList: KbqTagList;

    @ViewChild('autocompleteTagInput', {static: false}) autocompleteTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('autocompleteTagInput', {read: KbqTagInput, static: false}) autoCompleteTagInputRef: KbqTagInput;
    @ViewChild('autocompleteTagList', {static: false}) autocompleteTagList: KbqTagList;
    @ViewChild('autocomplete', {static: false}) autocomplete: KbqAutocomplete;

    @ViewChild('enterTagInput', {static: false}) enterTagInput: ElementRef<HTMLInputElement>;
    @ViewChild('enterInputTagList', {static: false}) enterInputTagList: KbqTagList;
    hasDuplicates: boolean;

    get canCreate(): boolean {
        const cleanedValue = (this.tagCtrl.value || '').trim();

        return cleanedValue && [...new Set(this.autocompleteAllTags.concat(this.autocompleteSelectedTags))]
            .every((tag) => tag !== cleanedValue);
    }

    ngAfterViewInit(): void {
        this.autocompleteFilteredTags = merge(
            this.autocompleteTagList.tagChanges.asObservable()
                .pipe(map((selectedTags: KbqTag[]) => {
                    const values = selectedTags.map((tag) => tag.value);

                    return this.autocompleteAllTags.filter((tag) => !values.includes(tag));
                })),
            this.tagCtrl.valueChanges
                .pipe(map((value: any) => {
                    const typedText = ((value?.new) ? value.value : value)?.trim();

                    this.autocompleteFilteredTagsByInput = typedText ?
                        this.filter(typedText) : this.autocompleteAllTags.slice();

                    const inputAndSelectionTagsDiff = this.autocompleteFilteredTagsByInput
                        .filter((tag) => !this.autocompleteSelectedTags.includes(tag));

                    // check for scenario where duplicate exists but also can create/select other tags
                    this.hasDuplicates = !inputAndSelectionTagsDiff.length && this.autoCompleteTagInputRef.hasDuplicates;

                    return inputAndSelectionTagsDiff;
                }))
        );
    }

    onClear(): void {
        this.inputTags.length = 0;
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
                value : this.autocompleteTagInput.nativeElement.value
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
        const filterValue = value.toLowerCase();

        return [...new Set(this.autocompleteAllTags.concat(this.autocompleteSelectedTags))]
            .filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
    }
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        KbqFormFieldModule,
        ReactiveFormsModule,

        KbqAutocompleteModule,
        KbqTagsModule,
        KbqIconModule,
        KbqTitleModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}


