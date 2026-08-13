import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DlOverviewExample } from 'packages/docs-examples/components/dl/dl-overview/dl-overview-example';
import { DlResizableExample } from 'packages/docs-examples/components/dl/dl-resizable/dl-resizable-example';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [DlResizableExample, DlOverviewExample],
    template: `
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
