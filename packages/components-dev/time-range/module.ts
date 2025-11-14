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
        <time-range-custom-trigger-example />
        <time-range-empty-type-list-example />
        <time-range-min-max-example />

        <time-range-as-form-field-example />

        <time-range-custom-range-types-example />

        <time-range-custom-option-example />
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
