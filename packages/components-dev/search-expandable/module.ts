import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';
import { SearchExpandableExamplesModule } from '../../docs-examples/components/search-expandable';

@Component({
    imports: [SearchExpandableExamplesModule],
    selector: 'dev-examples',
    template: `
        <search-expandable-overview-example />
        <br />
        <search-expandable-in-header-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    imports: [
        KbqLocaleServiceModule,
        KbqSearchExpandableModule,
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
