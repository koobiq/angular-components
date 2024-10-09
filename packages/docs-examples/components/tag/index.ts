import { AsyncPipe } from '@angular/common';
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
import { TagInputWithFormControlValidatorsExample } from './tag-input-with-form-control-validators/tag-input-with-form-control-validators-example';
import { TagInputExample } from './tag-input/tag-input-example';
import { TagListExample } from './tag-list/tag-list-example';
import { TagOverviewExample } from './tag-overview/tag-overview-example';
import { TagsAutocompleteOnpasteOffExample } from './tags-autocomplete-onpaste-off/tags-autocomplete-onpaste-off-example';
import { TagsInputOnpasteOffExample } from './tags-input-onpaste-off/tags-input-onpaste-off-example';

export {
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample,
    TagContentExample,
    TagFillAndStyleExample,
    TagHugContentExample,
    TagInputExample,
    TagInputWithFormControlValidatorsExample,
    TagListExample,
    TagOverviewExample,
    TagsAutocompleteOnpasteOffExample,
    TagsInputOnpasteOffExample
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

const STANDALONE_EXAMPLES = [
    TagInputWithFormControlValidatorsExample
];

@NgModule({
    imports: [
        ...STANDALONE_EXAMPLES,
        FormsModule,
        KbqFormFieldModule,
        ReactiveFormsModule,
        KbqAutocompleteModule,
        KbqTagsModule,
        KbqIconModule,
        KbqCheckboxModule,
        AsyncPipe
    ],
    declarations: EXAMPLES,
    exports: [...EXAMPLES, ...STANDALONE_EXAMPLES]
})
export class TagExamplesModule {}
