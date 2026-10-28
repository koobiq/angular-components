import { NgModule } from '@angular/core';
import { LinkApplicationExample } from './link-application/link-application-example';
import { LinkDisabledExample } from './link-disabled/link-disabled-example';
import { LinkExternalExample } from './link-external/link-external-example';
import { LinkIconsExample } from './link-icons/link-icons-example';
import { LinkInTextExample } from './link-in-text/link-in-text-example';
import { LinkMultiLineExample } from './link-multi-line/link-multi-line-example';
import { LinkOverviewExample } from './link-overview/link-overview-example';
import { LinkPrintExample } from './link-print/link-print-example';
import { LinkPseudoExample } from './link-pseudo/link-pseudo-example';
import { LinkSizeExample } from './link-size/link-size-example';
import { LinkUnderlineExample } from './link-underline/link-underline-example';
import { LinkVisitedExample } from './link-visited/link-visited-example';
import { LinkWithCaptionExample } from './link-with-caption/link-with-caption-example';

export {
    LinkApplicationExample,
    LinkDisabledExample,
    LinkExternalExample,
    LinkIconsExample,
    LinkInTextExample,
    LinkMultiLineExample,
    LinkOverviewExample,
    LinkPrintExample,
    LinkPseudoExample,
    LinkSizeExample,
    LinkUnderlineExample,
    LinkVisitedExample,
    LinkWithCaptionExample
};

const EXAMPLES = [
    LinkOverviewExample,
    LinkSizeExample,
    LinkUnderlineExample,
    LinkDisabledExample,
    LinkVisitedExample,
    LinkIconsExample,
    LinkMultiLineExample,
    LinkInTextExample,
    LinkExternalExample,
    LinkApplicationExample,
    LinkPseudoExample,
    LinkPrintExample,
    LinkWithCaptionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class LinkExamplesModule {}
