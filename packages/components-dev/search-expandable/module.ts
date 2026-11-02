import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';
import { SearchExpandableExamplesModule } from '../../docs-examples/components/search-expandable';

@Component({
    selector: 'dev-examples',
    imports: [SearchExpandableExamplesModule],
    template: `
        <search-expandable-overview-example />
        <br />
        <search-expandable-in-header-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        KbqLocaleServiceModule,
        KbqSearchExpandableModule,
        DevDocsExamples,
        FormsModule
    ],
    templateUrl: './template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    search: string;
}
