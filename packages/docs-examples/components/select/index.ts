import { ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';
import { SelectFooterExample } from './select-footer/select-footer-example';
import { SelectGroupsExample } from './select-groups/select-groups-example';
import { SelectMultipleOverviewExample } from './select-multiple-overview/select-multiple-overview-example';
import { SelectOverviewExample } from './select-overview/select-overview-example';
import { SelectPrioritizedSelectedExample } from './select-prioritized-selected/select-prioritized-selected-example';
import { SelectSearchOverviewExample } from './select-search-overview/select-search-overview-example';
import { SelectVirtualScrollExample } from './select-virtual-scroll/select-virtual-scroll-example';

export {
    SelectFooterExample,
    SelectGroupsExample,
    SelectMultipleOverviewExample,
    SelectOverviewExample,
    SelectPrioritizedSelectedExample,
    SelectSearchOverviewExample,
    SelectVirtualScrollExample
};

const EXAMPLES = [
    SelectOverviewExample,
    SelectMultipleOverviewExample,
    SelectSearchOverviewExample,
    SelectPrioritizedSelectedExample,
    SelectGroupsExample,
    SelectFooterExample,
    SelectVirtualScrollExample
];

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqInputModule,
        KbqIconModule,
        KbqLinkModule,
        KbqButtonModule,
        ScrollingModule,
        KbqHighlightModule,
        AsyncPipe
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SelectExamplesModule {}
