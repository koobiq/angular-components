import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';
import { SearchExpandableExamplesModule } from '../../docs-examples/components/search-expandable';

@Component({
    standalone: true,
    imports: [SearchExpandableExamplesModule],
    selector: 'dev-examples',
    template: `
        <search-expandable-overview-example />
        <br />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
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
