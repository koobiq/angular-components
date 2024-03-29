import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSplitterModule } from '@koobiq/components/splitter';

import { SplitterFixedExample } from './splitter-fixed/splitter-fixed-example';
import { SplitterNestedExample } from './splitter-nested/splitter-nested-example';
import { SplitterOverviewExample } from './splitter-overview/splitter-overview-example';
import { SplitterVerticalExample } from './splitter-vertical/splitter-vertical-example';


export {
    SplitterOverviewExample,
    SplitterFixedExample,
    SplitterVerticalExample,
    SplitterNestedExample
};

const EXAMPLES = [
    SplitterOverviewExample,
    SplitterFixedExample,
    SplitterVerticalExample,
    SplitterNestedExample
];

@NgModule({
    imports: [
        FormsModule,
        KbqSplitterModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SplitterExamplesModule {}
