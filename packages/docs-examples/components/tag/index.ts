import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagModule } from '@koobiq/components/tag';

import { TagAutocompleteOptionOperationsExample } from './tag-autocomplete-option-operations/tag-autocomplete-option-operations-example';
import { TagAutocompleteExample } from './tag-autocomplete/tag-autocomplete-example';
import { TagContentExample } from './tag-content/tag-content-example';
import { TagFillAndStyleExample } from './tag-fill-and-style/tag-fill-and-style-example';
import { TagHugContentExample } from './tag-hug-content/tag-hug-content-example';
import { TagInputExample } from './tag-input/tag-input-example';
import { TagListExample } from './tag-list/tag-list-example';
import { TagOverviewExample } from './tag-overview/tag-overview-example';


export {
    TagOverviewExample,
    TagFillAndStyleExample,
    TagContentExample,
    TagHugContentExample,
    TagInputExample,
    TagListExample,
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample
};

const EXAMPLES = [
    TagOverviewExample,
    TagFillAndStyleExample,
    TagContentExample,
    TagHugContentExample,
    TagInputExample,
    TagListExample,
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqFormFieldModule,
        ReactiveFormsModule,

        KbqAutocompleteModule,
        KbqTagModule,
        KbqIconModule,
        KbqCheckboxModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TagExamplesModule {}
