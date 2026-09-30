import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    SkeletonAccordionExample,
    SkeletonCheckableExample,
    SkeletonCodeBlockExample,
    SkeletonDlExample,
    SkeletonElementsExample,
    SkeletonFormFieldExample,
    SkeletonGridExample,
    SkeletonGroupExample,
    SkeletonInSidepanelExample,
    SkeletonOverviewExample,
    SkeletonTableExample,
    SkeletonTabsExample,
    SkeletonTreeExample,
    SkeletonTypographyExample
} from 'packages/docs-examples/components/skeleton';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        SkeletonOverviewExample,
        SkeletonElementsExample,
        SkeletonTypographyExample,
        SkeletonDlExample,
        SkeletonTableExample,
        SkeletonGridExample,
        SkeletonGroupExample,
        SkeletonFormFieldExample,
        SkeletonAccordionExample,
        SkeletonCheckableExample,
        SkeletonTabsExample,
        SkeletonTreeExample,
        SkeletonCodeBlockExample,
        SkeletonInSidepanelExample
    ],
    template: `
        <skeleton-overview-example />
        <hr />

        <skeleton-elements-example />
        <hr />

        <skeleton-typography-example />
        <hr />

        <skeleton-dl-example />
        <hr />

        <skeleton-table-example />
        <hr />

        <skeleton-grid-example />
        <hr />

        <skeleton-group-example />
        <hr />

        <skeleton-form-field-example />
        <hr />

        <skeleton-accordion-example />
        <hr />

        <skeleton-checkable-example />
        <hr />

        <skeleton-tabs-example />
        <hr />

        <skeleton-tree-example />
        <hr />

        <skeleton-code-block-example />
        <hr />

        <skeleton-in-sidepanel-example />
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
