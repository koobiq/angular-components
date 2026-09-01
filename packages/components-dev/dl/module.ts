import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DlLongTextExample } from 'packages/docs-examples/components/dl/dl-long-text/dl-long-text-example';
import { DlOverviewExample } from 'packages/docs-examples/components/dl/dl-overview/dl-overview-example';
import { DlResizableExample } from 'packages/docs-examples/components/dl/dl-resizable/dl-resizable-example';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [DlLongTextExample, DlResizableExample, DlOverviewExample],
    template: `
        <dl-long-text-example />
        <hr />
        <dl-resizable-example />
        <hr />
        <dl-overview-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
