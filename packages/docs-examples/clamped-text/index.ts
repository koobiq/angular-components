import { NgModule } from '@angular/core';
import { ClampedTextOverviewExample } from './clamped-text-overview/clamped-text-overview-example';

export { ClampedTextOverviewExample };

const EXAMPLES = [
    ClampedTextOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ClampedTextExamplesModule {}
