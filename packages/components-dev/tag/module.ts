import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    TagAutocompleteDraggableExample,
    TagAutocompleteEditableExample,
    TagAutocompleteOnpasteOffExample,
    TagAutocompleteOptionOperationsExample,
    TagAutocompleteOverviewExample,
    TagAutocompleteRemovableExample,
    TagAutocompleteSearchExample,
    TagAutocompleteWithFormControlValidatorsExample,
    TagDisabledExample,
    TagEditableExample,
    TagEditableWithValidationExample,
    TagFillAndStyleExample,
    TagInputDraggableExample,
    TagInputEditableExample,
    TagInputOnpasteOffExample,
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
    TagSelectableExample,
    TagWithIconExample
} from 'packages/docs-examples/components/tags';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        TagOverviewExample,
        TagFillAndStyleExample,
        TagLongTextExample,
        TagInputOverviewExample,
        TagListOverviewExample,
        TagAutocompleteOverviewExample,
        TagAutocompleteSearchExample,
        TagAutocompleteOptionOperationsExample,
        TagInputOnpasteOffExample,
        TagAutocompleteOnpasteOffExample,
        TagInputWithFormControlValidatorsExample,
        TagAutocompleteWithFormControlValidatorsExample,
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
        TagInputDraggableExample,
        TagAutocompleteDraggableExample,
        TagAutocompleteEditableExample,
        TagAutocompleteRemovableExample,
        TagSelectableExample
    ],
    template: `
        <!-- Autocomplete -->
        <tag-autocomplete-option-operations-example />
        <hr />
        <tag-autocomplete-overview-example />
        <hr />
        <tag-autocomplete-search-example />
        <hr />
        <tag-autocomplete-draggable-example />
        <hr />
        <tag-autocomplete-editable-example />
        <hr />
        <tag-autocomplete-removable-example />
        <hr />
        <tag-autocomplete-with-form-control-validators-example />
        <hr />
        <tag-autocomplete-onpaste-off-example />
        <hr />

        <!-- List -->
        <tag-list-draggable-example />
        <hr />
        <tag-list-removable-example />
        <hr />
        <tag-list-editable-example />
        <hr />
        <tag-list-overview-example />
        <hr />

        <!-- Input -->
        <tag-input-removable-example />
        <hr />
        <tag-input-draggable-example />
        <hr />
        <tag-input-editable-example />
        <hr />
        <tag-input-overview-example />
        <hr />
        <tag-input-with-form-control-validators-example />
        <hr />
        <tag-input-onpaste-off-example />
        <hr />

        <!-- Tag -->
        <tag-selectable-example />
        <hr />
        <tag-removable-example />
        <hr />
        <tag-editable-example />
        <hr />
        <tag-editable-with-validation-example />
        <hr />
        <tag-overview-example />
        <hr />
        <tag-fill-and-style-example />
        <hr />
        <tag-disabled-example />
        <hr />
        <tag-with-icon-example />
        <hr />
        <tag-long-text-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevDocsExamples,
        DevThemeToggle
    ],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
