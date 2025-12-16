import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { TimeRangeExamplesModule } from '../../docs-examples/components/time-range';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [TimeRangeExamplesModule],
    template: `
        <time-range-overview-example />
        <br />
        <time-range-custom-trigger-example />
        <br />
        <time-range-empty-type-list-example />
        <br />
        <time-range-min-max-example />
        <br />
        <time-range-as-form-field-example />
        <br />
        <time-range-custom-range-types-example />
        <br />
        <time-range-custom-option-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevLocaleSelector,
        DevThemeToggle,
        DevDocsExamples,
        KbqLocaleServiceModule
    ],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
