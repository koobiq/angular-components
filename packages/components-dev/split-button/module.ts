import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { SplitButtonExamplesModule } from '../../docs-examples/components/split-button';

@Component({
    standalone: true,
    imports: [SplitButtonExamplesModule],
    selector: 'dev-examples',
    template: `
        <split-button-overview-example />
        <br />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        KbqLocaleServiceModule,
        KbqSplitButtonModule,
        DevExamples,
        FormsModule
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    search: string;
}
