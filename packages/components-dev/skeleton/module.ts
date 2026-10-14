import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    SkeletonAccordionExample,
    SkeletonBasicExample,
    SkeletonCheckableExample,
    SkeletonCodeBlockExample,
    SkeletonDirectiveExample,
    SkeletonDlExample,
    SkeletonElementsExample,
    SkeletonFormFieldExample,
    SkeletonGridExample,
    SkeletonGroupExample,
    SkeletonInSidepanelExample,
    SkeletonTabsExample,
    SkeletonTreeExample,
    SkeletonTypographyExample
} from 'packages/docs-examples/components/skeleton';
import { DevThemeToggle } from '../theme-toggle';
import { DevSkeletonTableExample } from './examples/skeleton-table-example';

@Component({
    selector: 'dev-examples',
    imports: [
        SkeletonBasicExample,
        SkeletonDirectiveExample,
        SkeletonElementsExample,
        SkeletonTypographyExample,
        SkeletonDlExample,
        DevSkeletonTableExample,
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
        <skeleton-basic-example />
        <hr />

        <skeleton-directive-example />
        <hr />

        <skeleton-elements-example />
        <hr />

        <skeleton-typography-example />
        <hr />

        <skeleton-dl-example />
        <hr />

        <dev-skeleton-table-example />
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
