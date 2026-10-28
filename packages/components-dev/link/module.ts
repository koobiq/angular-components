import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
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
} from 'packages/docs-examples/components/link';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
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
    ],
    template: `
        <link-overview-example />
        <hr />
        <link-size-example />
        <hr />
        <link-underline-example />
        <hr />
        <link-disabled-example />
        <hr />
        <link-visited-example />
        <hr />
        <link-icons-example />
        <hr />
        <link-multi-line-example />
        <hr />
        <link-in-text-example />
        <hr />
        <link-external-example />
        <hr />
        <link-application-example />
        <hr />
        <link-pseudo-example />
        <hr />
        <link-print-example />
        <hr />
        <link-with-caption-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
