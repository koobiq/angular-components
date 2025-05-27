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
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-l);
            flex-wrap: wrap;
        }
        :host > * {
            border-radius: var(--kbq-size-border-radius);
            border: 1px solid var(--kbq-line-contrast-less);
            margin-bottom: var(--kbq-size-l);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [DevExamples, DevLocaleSelector, KbqLocaleServiceModule],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
