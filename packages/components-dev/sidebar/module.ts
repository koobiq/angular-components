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
export class DevExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevExamples
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
