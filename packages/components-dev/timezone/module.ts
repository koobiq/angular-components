import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqTimezoneModule } from '@koobiq/components/timezone';
import { TimezoneExamplesModule } from 'packages/docs-examples/components/timezone';

@Component({
    standalone: true,
    imports: [TimezoneExamplesModule],
    selector: 'dev-examples',
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
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        KbqTimezoneModule,
        DevExamples
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
