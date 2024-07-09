import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

import { TagAutocompleteOptionOperationsExample } from './tag-autocomplete-option-operations/tag-autocomplete-option-operations-example';
import { TagAutocompleteExample } from './tag-autocomplete/tag-autocomplete-example';
import { TagContentExample } from './tag-content/tag-content-example';
import { TagFillAndStyleExample } from './tag-fill-and-style/tag-fill-and-style-example';
import { TagHugContentExample } from './tag-hug-content/tag-hug-content-example';
import { TagInputExample } from './tag-input/tag-input-example';
import { TagListExample } from './tag-list/tag-list-example';
import { TagOverviewExample } from './tag-overview/tag-overview-example';
import { TagsAutocompleteOnpasteOffExample } from './tags-autocomplete-onpaste-off/tags-autocomplete-onpaste-off-example';
import { TagsInputOnpasteOffExample } from './tags-input-onpaste-off/tags-input-onpaste-off-example';


export {
    TagOverviewExample,
    TagFillAndStyleExample,
    TagContentExample,
    TagHugContentExample,
    TagInputExample,
    TagListExample,
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample,
    TagsInputOnpasteOffExample,
    TagsAutocompleteOnpasteOffExample
};

const EXAMPLES = [
    TagOverviewExample,
    TagFillAndStyleExample,
    TagContentExample,
    TagHugContentExample,
    TagInputExample,
    TagListExample,
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample,
    TagsInputOnpasteOffExample,
    TagsAutocompleteOnpasteOffExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqFormFieldModule,
        ReactiveFormsModule,

        KbqAutocompleteModule,
        KbqTagsModule,
        KbqIconModule,
        KbqCheckboxModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TagExamplesModule {}
