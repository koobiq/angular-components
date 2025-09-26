import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { TimeRangeExamplesModule } from '../../docs-examples/components/time-range';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [TimeRangeExamplesModule],
    selector: 'dev-examples',
    template: `
        <time-range-overview-example />
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-l);
            flex-wrap: wrap;
            padding-bottom: 100px;
        }
        :host > * {
            display: flex;
            align-items: flex-start;
            border-radius: var(--kbq-size-border-radius);
            border: 1px solid var(--kbq-line-contrast-less);
            margin-bottom: var(--kbq-size-l);
            padding: var(--kbq-size-m);
            flex: 1 0 auto;
            width: 40%;
        }
        ::ng-deep .kbq-inline-edit {
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        DevLocaleSelector,
        DevThemeToggle,
        DevExamples,
        KbqLocaleServiceModule
    ],
    selector: 'dev-app',
    styleUrls: ['styles.scss'],
    templateUrl: 'template.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
