import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { ClampedTextExamplesModule } from '../../docs-examples/components/clamped-text';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    standalone: true,
    imports: [ClampedTextExamplesModule],
    selector: 'dev-examples',
    template: `
        <clamped-text-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        DevExamples,
        DevLocaleSelector,
        KbqLocaleServiceModule
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
