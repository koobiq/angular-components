import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AgGridExamplesModule } from 'packages/docs-examples/components/ag-grid';

@Component({
    standalone: true,
    imports: [AgGridExamplesModule],
    selector: 'dev-ag-grid-examples',
    template: `
        <ag-grid-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAgGridExamples {}

@Component({
    selector: 'app',
    standalone: true,
    imports: [DevAgGridExamples],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
