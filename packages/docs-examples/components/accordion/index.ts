import { NgModule } from '@angular/core';
import { AccordionOverviewExample } from './accordion-overview/accordion-overview-example';

export { AccordionOverviewExample };

const EXAMPLES = [
    AccordionOverviewExample
];

@NgModule({
    imports: [EXAMPLES],
    exports: EXAMPLES
})
export class AlertExamplesModule {}
