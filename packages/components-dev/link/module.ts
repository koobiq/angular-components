import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import {
    LinkApplicationExample,
    LinkCaptionExample,
    LinkDisabledExample,
    LinkExternalExample,
    LinkGeneralExample,
    LinkIconsExample,
    LinkMultiLineExample,
    LinkOverviewExample,
    LinkPrepositionsExample,
    LinkPrintExample,
    LinkPseudoExample,
    LinkTargetBlankExample,
    LinkVisitedExample
} from 'packages/docs-examples/components/link';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        LinkApplicationExample,
        LinkCaptionExample,
        LinkDisabledExample,
        LinkExternalExample,
        LinkGeneralExample,
        LinkIconsExample,
        LinkMultiLineExample,
        LinkOverviewExample,
        LinkPrepositionsExample,
        LinkPrintExample,
        LinkPseudoExample,
        LinkTargetBlankExample,
        LinkVisitedExample
    ],
    template: `
        <link-application-example />
        <hr />
        <link-caption-example />
        <hr />
        <link-disabled-example />
        <hr />
        <link-external-example />
        <hr />
        <link-general-example />
        <hr />
        <link-icons-example />
        <hr />
        <link-multi-line-example />
        <hr />
        <link-overview-example />
        <hr />
        <link-prepositions-example />
        <hr />
        <link-print-example />
        <hr />
        <link-pseudo-example />
        <hr />
        <link-target-blank-example />
        <hr />
        <link-visited-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqLinkModule, KbqIconModule, DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    readonly url = 'http://localhost:3003/';
}
