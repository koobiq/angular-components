import { NgModule } from '@angular/core';
import { ClampedListExample } from './clamped-list/clamped-list-example';
import { ClampedListDottedExample } from './clamped-list-dotted/clamped-list-dotted-example';
import { ClampedListOverviewExample } from './clamped-list-overview/clamped-list-overview-example';
import { ClampedTextExternalStateExample } from './clamped-text-external-state/clamped-text-external-state-example';
import { ClampedTextOverviewExample } from './clamped-text-overview/clamped-text-overview-example';

export {
    ClampedListDottedExample,
    ClampedListExample,
    ClampedListOverviewExample,
    ClampedTextExternalStateExample,
    ClampedTextOverviewExample
};

const EXAMPLES = [
    ClampedTextOverviewExample,
    ClampedTextExternalStateExample,
    ClampedListExample,
    ClampedListOverviewExample,
    ClampedListDottedExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ClampedTextExamplesModule {}
