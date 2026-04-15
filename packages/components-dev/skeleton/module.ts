import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    SkeletonDirectiveExample,
    SkeletonInSidepanelExample,
    SkeletonOverviewExample
} from 'packages/docs-examples/components/skeleton';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [SkeletonOverviewExample, SkeletonInSidepanelExample, SkeletonDirectiveExample],
    template: `
        <skeleton-overview-example />
        <hr />

        <skeleton-in-sidepanel-example />
        <hr />

        <skeleton-directive-example />
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
