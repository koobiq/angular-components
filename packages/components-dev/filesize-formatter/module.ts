import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { FilesizeFormatterExamplesModule } from '../../docs-examples/components/filesize-formatter';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    selector: 'dev-examples',
    imports: [FilesizeFormatterExamplesModule],
    template: `
        <filesize-formatter-overview-example />
        <filesize-formatter-table-number-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples, DevLocaleSelector, KbqLocaleServiceModule],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
