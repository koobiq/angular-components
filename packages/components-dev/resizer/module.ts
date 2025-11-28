import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ResizerOverviewExample } from 'packages/docs-examples/components/resizer/resizer-overview/resizer-overview-example';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [ResizerOverviewExample],
    selector: 'dev-examples',
    template: `
        <resizer-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [DevExamples, DevThemeToggle],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
