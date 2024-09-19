import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSplitterModule } from '@koobiq/components/splitter';
import { SplitterDynamicDataExample } from './splitter-dynamic-data/splitter-dynamic-data-example';
import { SplitterFixedExample } from './splitter-fixed/splitter-fixed-example';
import { SplitterNestedExample } from './splitter-nested/splitter-nested-example';
import { SplitterOverviewExample } from './splitter-overview/splitter-overview-example';
import { SplitterVerticalExample } from './splitter-vertical/splitter-vertical-example';

export {
    SplitterDynamicDataExample,
    SplitterFixedExample,
    SplitterNestedExample,
    SplitterOverviewExample,
    SplitterVerticalExample
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
        FormsModule,
        KbqSplitterModule,
        KbqButtonModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SplitterExamplesModule {}
