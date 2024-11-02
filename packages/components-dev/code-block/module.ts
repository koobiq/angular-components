import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqCodeBlockModule, kbqCodeBlockLocaleConfigurationProvider } from '@koobiq/components/code-block';
import { CodeBlockExamplesModule } from 'packages/docs-examples/components/code-block';

@Component({
    selector: 'app',
    standalone: true,
    imports: [
        KbqCodeBlockModule,
        CodeBlockExamplesModule
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
export class CodeBlockDev {}
