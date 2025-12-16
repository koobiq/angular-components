import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqCodeBlockModule, kbqCodeBlockLocaleConfigurationProvider } from '@koobiq/components/code-block';
import { CodeBlockExamplesModule } from 'packages/docs-examples/components/code-block';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [CodeBlockExamplesModule],
    template: `
        <code-block-with-soft-wrap-example />
        <hr />
        <code-block-with-max-height-example />
        <hr />
        <code-block-with-line-numbers-example />
        <hr />
        <code-block-with-tabs-example />
        <hr />
        <code-block-with-tabs-and-shadow-example />
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
        KbqCodeBlockModule,
        DevDocsExamples,
        DevThemeToggle,
        DevLocaleSelector
    ],
    providers: [
        kbqCodeBlockLocaleConfigurationProvider({
            softWrapOnTooltip: '*dev* Enable word wrap',
            softWrapOffTooltip: '*dev* Disable word wrap',
            downloadTooltip: '*dev* Download',
            copiedTooltip: '*dev* ✓ Copied',
            copyTooltip: '*dev* Copy',
            viewAllText: '*dev* Show all',
            viewLessText: '*dev* Show less',
            openExternalSystemTooltip: '*dev* Open in the external system'
        })

    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
