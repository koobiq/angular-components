import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AgGridExamplesModule } from 'packages/docs-examples/components/ag-grid';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [AgGridExamplesModule],
    template: `
        <ag-grid-overview-example />
        <hr />
        <ag-grid-row-dragging-example />
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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
