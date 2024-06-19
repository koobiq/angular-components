import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

import { TagsAutocompleteOptionOperationsExample } from './tags-autocomplete-option-operations/tags-autocomplete-option-operations-example';
import { TagsAutocompleteExample } from './tags-autocomplete/tags-autocomplete-example';
import { TagsContentExample } from './tags-content/tags-content-example';
import { TagsFillAndStyleExample } from './tags-fill-and-style/tags-fill-and-style-example';
import { TagsHugContentExample } from './tags-hug-content/tags-hug-content-example';
import { TagsInputExample } from './tags-input/tags-input-example';
import { TagsListExample } from './tags-list/tags-list-example';
import { TagsOverviewExample } from './tags-overview/tags-overview-example';


export {
    TagsOverviewExample,
    TagsFillAndStyleExample,
    TagsContentExample,
    TagsHugContentExample,
    TagsInputExample,
    TagsListExample,
    TagsAutocompleteExample,
    TagsAutocompleteOptionOperationsExample
};

const EXAMPLES = [
    TagsOverviewExample,
    TagsFillAndStyleExample,
    TagsContentExample,
    TagsHugContentExample,
    TagsInputExample,
    TagsListExample,
    TagsAutocompleteExample,
    TagsAutocompleteOptionOperationsExample
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
export class TagsExamplesModule {}
