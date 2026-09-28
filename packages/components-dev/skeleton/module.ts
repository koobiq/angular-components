import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    SkeletonAlertExample,
    SkeletonBadgeExample,
    SkeletonButtonExample,
    SkeletonDlExample,
    SkeletonInSidepanelExample,
    SkeletonListExample,
    SkeletonOverviewExample,
    SkeletonTableExample,
    SkeletonTagExample,
    SkeletonTreeExample,
    SkeletonTypographyExample
} from 'packages/docs-examples/components/skeleton';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        SkeletonOverviewExample,
        SkeletonInSidepanelExample,
        SkeletonButtonExample,
        SkeletonBadgeExample,
        SkeletonTagExample,
        SkeletonAlertExample,
        SkeletonDlExample,
        SkeletonTableExample,
        SkeletonTypographyExample,
        SkeletonListExample,
        SkeletonTreeExample
    ],
    template: `
        <skeleton-overview-example />
        <hr />

        <skeleton-in-sidepanel-example />
        <hr />

        <skeleton-button-example />
        <hr />

        <skeleton-badge-example />
        <hr />

        <skeleton-tag-example />
        <hr />

        <skeleton-alert-example />
        <hr />

        <skeleton-dl-example />
        <hr />

        <skeleton-table-example />
        <hr />

        <skeleton-typography-example />
        <hr />

        <skeleton-list-example />
        <hr />

        <skeleton-tree-example />
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
