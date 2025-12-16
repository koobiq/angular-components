import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqTimezoneModule } from '@koobiq/components/timezone';
import { TimezoneExamplesModule } from 'packages/docs-examples/components/timezone';

@Component({
    selector: 'dev-examples',
    imports: [TimezoneExamplesModule],
    template: `
        <timezone-overview-example />
        <hr />
        <timezone-search-overview-example />
        <hr />
        <timezone-trigger-overview-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        KbqTimezoneModule,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
