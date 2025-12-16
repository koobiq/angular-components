import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ResizerOverviewExample } from 'packages/docs-examples/components/resizer/resizer-overview/resizer-overview-example';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [ResizerOverviewExample],
    template: `
        <resizer-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
