import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqHighlightModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';

import { TreeSelectChildSelectionOverviewExample } from './tree-select-child-selection-overview/tree-select-child-selection-overview-example';
import { TreeSelectFooterOverviewExample } from './tree-select-footer-overview/tree-select-footer-overview-example';
import { TreeSelectLazyloadExample } from './tree-select-lazyload/tree-select-lazyload-example';
import { TreeSelectMultipleOverviewExample } from './tree-select-multiple-overview/tree-select-multiple-overview-example';
import { TreeSelectOverviewExample } from './tree-select-overview/tree-select-overview-example';
import { TreeSelectSearchOverviewExample } from './tree-select-search-overview/tree-select-search-overview-example';


export {
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectChildSelectionOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectLazyloadExample,
    TreeSelectFooterOverviewExample
};

const EXAMPLES = [
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectChildSelectionOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectLazyloadExample,
    TreeSelectFooterOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqTreeModule,
        KbqSelectModule,
        KbqHighlightModule,
        KbqTreeSelectModule,
        KbqInputModule,
        KbqIconModule,
        KbqProgressSpinnerModule,
        KbqPseudoCheckboxModule,
        KbqLinkModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TreeSelectExamplesModule {}
