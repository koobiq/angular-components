import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { SidebarExamplesModule } from 'packages/docs-examples/components/sidebar';

@Component({
    standalone: true,
    imports: [SidebarExamplesModule],
    selector: 'dev-examples',
    template: `
        <sidebar-overview-example />
        <hr />
        <sidebar-with-splitter-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    standalone: true,
    imports: [
        DevDocsExamples
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
