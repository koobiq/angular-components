import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { FilesizeFormatterExamplesModule } from '../../docs-examples/components/filesize-formatter';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    standalone: true,
    imports: [FilesizeFormatterExamplesModule],
    selector: 'dev-examples',
    template: `
        <filesize-formatter-overview-example />
        <filesize-formatter-table-number-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    standalone: true,
    imports: [DevDocsExamples, DevLocaleSelector, KbqLocaleServiceModule],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
