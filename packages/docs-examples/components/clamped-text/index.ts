import { NgModule } from '@angular/core';
import { ClampedListVerticalExample } from './clamped-list-vertical/clamped-list-vertical-example';
import { ClampedListExample } from './clamped-list/clamped-list-example';
import { ClampedTextOverviewExample } from './clamped-text-overview/clamped-text-overview-example';

export { ClampedTextOverviewExample };

const EXAMPLES = [
    ClampedTextOverviewExample,
    ClampedListExample,
    ClampedListVerticalExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ClampedTextExamplesModule {}
