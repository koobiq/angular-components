import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AgGridThemeExamplesModule } from 'packages/docs-examples/components/ag-grid-theme';

@Component({
    standalone: true,
    imports: [AgGridThemeExamplesModule],
    selector: 'dev-ag-grid-theme-examples',
    template: `
        <ag-grid-theme-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAgGridThemeExamples {}

@Component({
    selector: 'app',
    standalone: true,
    imports: [DevAgGridThemeExamples],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
