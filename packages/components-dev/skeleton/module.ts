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
    SkeletonTableExample,
    SkeletonTabsExample,
    SkeletonTreeExample,
    SkeletonTypographyExample
} from 'packages/docs-examples/components/skeleton';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        SkeletonBasicExample,
        SkeletonDirectiveExample,
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
        <h2 class="dev-example-title">Skeleton basic block</h2>
        <skeleton-basic-example />
        <hr />

        <h2 class="dev-example-title">Skeleton directive</h2>
        <skeleton-directive-example />
        <hr />

        <h2 class="dev-example-title">Skeleton element presets</h2>
        <skeleton-elements-example />
        <hr />

        <h2 class="dev-example-title">Skeleton typography preset</h2>
        <skeleton-typography-example />
        <hr />

        <h2 class="dev-example-title">Skeleton description list preset</h2>
        <skeleton-dl-example />
        <hr />

        <h2 class="dev-example-title">Skeleton table preset</h2>
        <skeleton-table-example />
        <hr />

        <h2 class="dev-example-title">Skeleton grid preset</h2>
        <skeleton-grid-example />
        <hr />

        <h2 class="dev-example-title">Skeleton group preset</h2>
        <skeleton-group-example />
        <hr />

        <h2 class="dev-example-title">Skeleton form field preset</h2>
        <skeleton-form-field-example />
        <hr />

        <h2 class="dev-example-title">Skeleton accordion preset</h2>
        <skeleton-accordion-example />
        <hr />

        <h2 class="dev-example-title">Skeleton checkable preset</h2>
        <skeleton-checkable-example />
        <hr />

        <h2 class="dev-example-title">Skeleton tabs preset</h2>
        <skeleton-tabs-example />
        <hr />

        <h2 class="dev-example-title">Skeleton tree preset</h2>
        <skeleton-tree-example />
        <hr />

        <h2 class="dev-example-title">Skeleton in place of a code block</h2>
        <skeleton-code-block-example />
        <hr />

        <h2 class="dev-example-title">Skeleton in sidepanel</h2>
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
