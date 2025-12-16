import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { SplitButtonExamplesModule } from '../../docs-examples/components/split-button';

@Component({
    selector: 'dev-examples',
    imports: [SplitButtonExamplesModule],
    template: `
        <split-button-overview-example />
        <br />
        <split-button-styles-example />
        <br />
        <split-button-content-example />
        <br />
        <split-button-text-overflow-example />
        <br />
        <split-button-disabled-state-example />
        <br />
        <split-button-progress-state-example />
        <br />
        <split-button-menu-width-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        KbqLocaleServiceModule,
        KbqSplitButtonModule,
        DevDocsExamples,
        KbqButtonModule,
        KbqIconModule
    ],
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    search: string;
}
