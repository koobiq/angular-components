import { NgModule } from '@angular/core';
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
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SplitterExamplesModule {}
