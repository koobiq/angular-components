import { NgModule } from '@angular/core';
import { TagAutocompleteOptionOperationsExample } from './tag-autocomplete-option-operations/tag-autocomplete-option-operations-example';
import { TagAutocompleteExample } from './tag-autocomplete/tag-autocomplete-example';
import { TagDisabledExample } from './tag-disabled/tag-disabled-example';
import { TagEditableWithValidationExample } from './tag-editable-with-validation/tag-editable-with-validation-example';
import { TagEditableExample } from './tag-editable/tag-editable-example';
import { TagFillAndStyleExample } from './tag-fill-and-style/tag-fill-and-style-example';
import { TagInputEditableExample } from './tag-input-editable/tag-input-editable-example';
import { TagInputWithFormControlValidatorsExample } from './tag-input-with-form-control-validators/tag-input-with-form-control-validators-example';
import { TagInputExample } from './tag-input/tag-input-example';
import { TagListEditableExample } from './tag-list-editable/tag-list-editable-example';
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
    TagEditableExample,
    TagEditableWithValidationExample,
    TagFillAndStyleExample,
    TagInputEditableExample,
    TagInputExample,
    TagInputWithFormControlValidatorsExample,
    TagListEditableExample,
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
    TagWithRemoveButtonExample,
    TagEditableExample,
    TagListEditableExample,
    TagInputEditableExample,
    TagEditableWithValidationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TagExamplesModule {}
