import { NgModule } from '@angular/core';
import { TreeAccessRightsExample } from './tree-access-rights/tree-access-rights-example';
import { TreeActionButtonExample } from './tree-action-button/tree-action-button-example';
import { TreeCheckedFilteringExample } from './tree-checked-filtering/tree-checked-filtering-example';
import { TreeCustomFilteringExample } from './tree-custom-filtering/tree-custom-filtering-example';
import { TreeDescendantsSubcategoriesExample } from './tree-descendants-subcategories/tree-descendants-subcategories-example';
import { TreeFilteringExample } from './tree-filtering/tree-filtering-example';
import { TreeLazyloadExample } from './tree-lazyload/tree-lazyload-example';
import { TreeMultipleCheckboxExample } from './tree-multiple-checkbox/tree-multiple-checkbox-example';
import { TreeMultipleChecklistExample } from './tree-multiple-checklist/tree-multiple-checklist-example';
import { TreeMultipleKeyboardExample } from './tree-multiple-keyboard/tree-multiple-keyboard-example';
import { TreeOverviewExample } from './tree-overview/tree-overview-example';

export {
    TreeAccessRightsExample,
    TreeActionButtonExample,
    TreeCheckedFilteringExample,
    TreeCustomFilteringExample,
    TreeDescendantsSubcategoriesExample,
    TreeFilteringExample,
    TreeLazyloadExample,
    TreeMultipleCheckboxExample,
    TreeMultipleChecklistExample,
    TreeMultipleKeyboardExample,
    TreeOverviewExample
};

const EXAMPLES = [
    TreeActionButtonExample,
    TreeOverviewExample,
    TreeMultipleCheckboxExample,
    TreeMultipleChecklistExample,
    TreeMultipleKeyboardExample,
    TreeFilteringExample,
    TreeCustomFilteringExample,
    TreeCheckedFilteringExample,
    TreeLazyloadExample,
    TreeDescendantsSubcategoriesExample,
    TreeAccessRightsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TreeExamplesModule {}
