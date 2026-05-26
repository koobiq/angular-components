import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    CodeBlockHeaderPinnedExample,
    CodeBlockOverviewExample,
    CodeBlockWithCustomLocaleConfigurationExample,
    CodeBlockWithFilledExample,
    CodeBlockWithLinkExample,
    CodeBlockWithMaxHeightExample,
    CodeBlockWithNoBorderExample,
    CodeBlockWithSoftWrapExample,
    CodeBlockWithTabsAndShadowExample,
    CodeBlockWithTabsExample
} from 'packages/docs-examples/components/code-block';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        CodeBlockWithSoftWrapExample,
        CodeBlockWithTabsExample,
        CodeBlockWithMaxHeightExample,
        CodeBlockWithFilledExample,
        CodeBlockWithNoBorderExample,
        CodeBlockOverviewExample,
        CodeBlockWithCustomLocaleConfigurationExample,
        CodeBlockWithTabsAndShadowExample,
        CodeBlockWithLinkExample,
        CodeBlockHeaderPinnedExample
    ],
    template: `
        <code-block-with-soft-wrap-example />
        <hr />
        <code-block-with-max-height-example />
        <hr />
        <code-block-overview-example />
        <hr />
        <code-block-with-tabs-example />
        <hr />
        <code-block-with-tabs-and-shadow-example />
        <hr />
        <code-block-header-pinned-example />
        <hr />
        <code-block-with-filled-example />
        <hr />
        <code-block-with-no-border-example />
        <hr />
        <code-block-with-custom-locale-configuration-example />
        <hr />
        <code-block-with-link-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevDocsExamples,
        DevThemeToggle,
        DevLocaleSelector
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
