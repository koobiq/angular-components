import { NgModule } from '@angular/core';
import { AccordionContentExample } from './accordion-content/accordion-content-example';
import { AccordionHeaderExample } from './accordion-header/accordion-header-example';
import { AccordionInPanelExample } from './accordion-in-panel/accordion-in-panel-example';
import { AccordionInSectionExample } from './accordion-in-section/accordion-in-section-example';
import { AccordionInactiveSectionExample } from './accordion-inactive-section/accordion-inactive-section-example';
import { AccordionOverviewExample } from './accordion-overview/accordion-overview-example';
import { AccordionSectionsExample } from './accordion-sections/accordion-sections-example';
import { AccordionStatesExample } from './accordion-states/accordion-states-example';

export {
    AccordionContentExample,
    AccordionHeaderExample,
    AccordionInactiveSectionExample,
    AccordionInPanelExample,
    AccordionInSectionExample,
    AccordionOverviewExample,
    AccordionSectionsExample,
    AccordionStatesExample
};

const EXAMPLES = [
    AccordionOverviewExample,
    AccordionStatesExample,
    AccordionSectionsExample,
    AccordionInactiveSectionExample,
    AccordionHeaderExample,
    AccordionContentExample,
    AccordionInSectionExample,
    AccordionInPanelExample
];

@NgModule({
    imports: [EXAMPLES],
    exports: EXAMPLES
})
export class AccordionExamplesModule {}
