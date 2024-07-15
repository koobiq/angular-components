import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqHighlightModule, KbqOptionModule } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTreeModule } from '@koobiq/components/tree';
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
    TreeOverviewExample,
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
    TreeAccessRightsExample,
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqTreeModule,
        KbqIconModule,
        KbqHighlightModule,
        KbqCheckboxModule,
        KbqDropdownModule,
        KbqToolTipModule,
        KbqOptionModule,
        KbqProgressSpinnerModule,
        ClipboardModule,
        KbqButtonToggleModule,
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
})
export class TreeExamplesModule {}
