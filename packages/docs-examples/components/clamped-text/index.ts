import { NgModule } from '@angular/core';
import { ClampedListDottedExample } from './clamped-list-dotted/clamped-list-dotted-example';
import { ClampedListVerticalExample } from './clamped-list-vertical/clamped-list-vertical-example';
import { ClampedListExample } from './clamped-list/clamped-list-example';
import { ClampedTextOverviewExample } from './clamped-text-overview/clamped-text-overview-example';

export { ClampedListDottedExample, ClampedListExample, ClampedListVerticalExample, ClampedTextOverviewExample };

const EXAMPLES = [
    ClampedTextOverviewExample,
    ClampedListExample,
    ClampedListVerticalExample,
    ClampedListDottedExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ClampedTextExamplesModule {}
