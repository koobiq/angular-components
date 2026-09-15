import { NgModule } from '@angular/core';
import { SplitterAppearanceExample } from './splitter-appearance/splitter-appearance-example';
import { SplitterCollapsibleExample } from './splitter-collapsible/splitter-collapsible-example';
import { SplitterConstraintsExample } from './splitter-constraints/splitter-constraints-example';
import { SplitterDisabledExample } from './splitter-disabled/splitter-disabled-example';
import { SplitterNestedExample } from './splitter-nested/splitter-nested-example';
import { SplitterOrientationExample } from './splitter-orientation/splitter-orientation-example';
import { SplitterOverviewExample } from './splitter-overview/splitter-overview-example';
import { SplitterSnapExample } from './splitter-snap/splitter-snap-example';

export {
    SplitterAppearanceExample,
    SplitterCollapsibleExample,
    SplitterConstraintsExample,
    SplitterDisabledExample,
    SplitterNestedExample,
    SplitterOrientationExample,
    SplitterOverviewExample,
    SplitterSnapExample
};

const EXAMPLES = [
    SplitterOverviewExample,
    SplitterAppearanceExample,
    SplitterOrientationExample,
    SplitterConstraintsExample,
    SplitterSnapExample,
    SplitterCollapsibleExample,
    SplitterNestedExample,
    SplitterDisabledExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SplitterExamplesModule {}
