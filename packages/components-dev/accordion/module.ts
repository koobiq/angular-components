import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqIconModule } from '@koobiq/components/icon';
import { AccordionExamplesModule } from 'packages/docs-examples/components/accordion';

@Component({
    selector: 'dev-examples',
    imports: [AccordionExamplesModule],
    template: `
        <accordion-overview-example />
        <hr />
        <accordion-states-example />
        <hr />
        <accordion-sections-example />
        <hr />
        <accordion-inactive-section-example />
        <hr />
        <accordion-header-example />
        <hr />
        <accordion-content-example />
        <hr />
        <accordion-interactive-elements-example />
        <hr />
        <accordion-in-section-example />
        <hr />
        <accordion-in-panel-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqAccordionModule, KbqIconModule, DevDocsExamples],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
