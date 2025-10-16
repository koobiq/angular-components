import { NgModule } from '@angular/core';
import { TagAutocompleteOptionOperationsExample } from './tag-autocomplete-option-operations/tag-autocomplete-option-operations-example';
import { TagAutocompleteExample } from './tag-autocomplete/tag-autocomplete-example';
import { TagDisabledExample } from './tag-disabled/tag-disabled-example';
import { TagEditableWithValidationExample } from './tag-editable-with-validation/tag-editable-with-validation-example';
import { TagEditableExample } from './tag-editable/tag-editable-example';
import { TagFillAndStyleExample } from './tag-fill-and-style/tag-fill-and-style-example';
import { TagInputDraggableExample } from './tag-input-draggable/tag-input-draggable-example';
import { TagInputEditableExample } from './tag-input-editable/tag-input-editable-example';
import { TagInputOverviewExample } from './tag-input-overview/tag-input-overview-example';
import { TagInputRemovableExample } from './tag-input-removable/tag-input-removable-example';
import { TagInputWithFormControlValidatorsExample } from './tag-input-with-form-control-validators/tag-input-with-form-control-validators-example';
import { TagListDraggableExample } from './tag-list-draggable/tag-list-draggable-example';
import { TagListEditableExample } from './tag-list-editable/tag-list-editable-example';
import { TagListOverviewExample } from './tag-list-overview/tag-list-overview-example';
import { TagListRemovableExample } from './tag-list-removable/tag-list-removable-example';
import { TagLongTextExample } from './tag-long-text/tag-long-text-example';
import { TagOverviewExample } from './tag-overview/tag-overview-example';
import { TagRemovableExample } from './tag-removable/tag-removable-example';
import { TagWithIconExample } from './tag-with-icon/tag-with-icon-example';
import { TagsAutocompleteOnpasteOffExample } from './tags-autocomplete-onpaste-off/tags-autocomplete-onpaste-off-example';
import { TagsInputOnpasteOffExample } from './tags-input-onpaste-off/tags-input-onpaste-off-example';

export {
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample,
    TagDisabledExample,
    TagEditableExample,
    TagEditableWithValidationExample,
    TagFillAndStyleExample,
    TagInputDraggableExample,
    TagInputEditableExample,
    TagInputOverviewExample,
    TagInputRemovableExample,
    TagInputWithFormControlValidatorsExample,
    TagListDraggableExample,
    TagListEditableExample,
    TagListOverviewExample,
    TagListRemovableExample,
    TagLongTextExample,
    TagOverviewExample,
    TagRemovableExample,
    TagsAutocompleteOnpasteOffExample,
    TagsInputOnpasteOffExample,
    TagWithIconExample
};

const EXAMPLES = [
    TagOverviewExample,
    TagFillAndStyleExample,
    TagLongTextExample,
    TagInputOverviewExample,
    TagListOverviewExample,
    TagAutocompleteExample,
    TagAutocompleteOptionOperationsExample,
    TagsInputOnpasteOffExample,
    TagsAutocompleteOnpasteOffExample,
    TagInputWithFormControlValidatorsExample,
    TagDisabledExample,
    TagWithIconExample,
    TagRemovableExample,
    TagListRemovableExample,
    TagEditableExample,
    TagListEditableExample,
    TagInputEditableExample,
    TagEditableWithValidationExample,
    TagInputRemovableExample,
    TagListDraggableExample,
    TagInputDraggableExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TagExamplesModule {}
