import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DlExamplesModule } from 'packages/docs-examples/components/dl';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [DlExamplesModule],
    template: `
        <dl-overview-example />
        <hr />
        <dl-wide-example />
        <hr />
        <dl-vertical-example />
        <hr />
        <dl-vertical-breakpoint-example />
        <hr />
        <dl-alignment-example />
        <hr />
        <dl-dt-width-example />
        <hr />
        <dl-resizable-example />
        <hr />
        <dl-min-width-example />
        <hr />
        <dl-width-sync-example />
        <hr />
        <dl-long-text-example />
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
