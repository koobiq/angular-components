import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSplitterModule } from '@koobiq/components/splitter';

import { SplitterFixedExample } from './splitter-fixed/splitter-fixed-example';
import { SplitterNestedExample } from './splitter-nested/splitter-nested-example';
import { SplitterOverviewExample } from './splitter-overview/splitter-overview-example';
import { SplitterVerticalExample } from './splitter-vertical/splitter-vertical-example';
import { SplitterDynamicDataExample } from './splitter-dynamic-data/splitter-dynamic-data-example';
import { KbqButtonModule } from '@koobiq/components/button';
import { CommonModule } from '@angular/common';


export {
    SplitterOverviewExample,
    SplitterFixedExample,
    SplitterVerticalExample,
    SplitterNestedExample,
    SplitterDynamicDataExample
};

const EXAMPLES = [
    SplitterOverviewExample,
    SplitterFixedExample,
    SplitterVerticalExample,
    SplitterNestedExample,
    SplitterDynamicDataExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqSplitterModule,
        KbqButtonModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SplitterExamplesModule {}
