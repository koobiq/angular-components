import { NgModule } from '@angular/core';
import { TagAutocompleteOptionOperationsExample } from './tag-autocomplete-option-operations/tag-autocomplete-option-operations-example';
import { TagAutocompleteExample } from './tag-autocomplete/tag-autocomplete-example';
import { TagDisabledExample } from './tag-disabled/tag-disabled-example';
import { TagFillAndStyleExample } from './tag-fill-and-style/tag-fill-and-style-example';
import { TagInputWithFormControlValidatorsExample } from './tag-input-with-form-control-validators/tag-input-with-form-control-validators-example';
import { TagInputExample } from './tag-input/tag-input-example';
import { TagListExample } from './tag-list/tag-list-example';
import { TagLongTextExample } from './tag-long-text/tag-long-text-example';
import { TagOverviewExample } from './tag-overview/tag-overview-example';
import { TagWithIconExample } from './tag-with-icon/tag-with-icon-example';
import { TagWithRemoveButtonExample } from './tag-with-remove-button/tag-with-remove-button-example';
import { TagsAutocompleteOnpasteOffExample } from './tags-autocomplete-onpaste-off/tags-autocomplete-onpaste-off-example';
import { TagsInputOnpasteOffExample } from './tags-input-onpaste-off/tags-input-onpaste-off-example';

export {
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample,
    TagDisabledExample,
    TagFillAndStyleExample,
    TagInputExample,
    TagInputWithFormControlValidatorsExample,
    TagListExample,
    TagLongTextExample,
    TagOverviewExample,
    TagsAutocompleteOnpasteOffExample,
    TagsInputOnpasteOffExample,
    TagWithIconExample,
    TagWithRemoveButtonExample
};

const EXAMPLES = [
    TagOverviewExample,
    TagFillAndStyleExample,
    TagLongTextExample,
    TagInputExample,
    TagListExample,
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample,
    TagsInputOnpasteOffExample,
    TagsAutocompleteOnpasteOffExample,
    TagInputWithFormControlValidatorsExample,
    TagDisabledExample,
    TagWithIconExample,
    TagWithRemoveButtonExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TagExamplesModule {}
