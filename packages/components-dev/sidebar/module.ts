import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { SidebarExamplesModule } from 'packages/docs-examples/components/sidebar';

@Component({
    selector: 'dev-examples',
    imports: [SidebarExamplesModule],
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
    selector: 'dev-app',
    imports: [
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
