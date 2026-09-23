import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { DividerOverviewExample, DividerVerticalExample } from 'packages/docs-examples/components/divider';
import { E2eDividerStateAndStyle } from '../../components/divider/e2e';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        DividerOverviewExample,
        DividerVerticalExample
    ],
    template: `
        <divider-overview-example />
        <hr />
        <divider-vertical-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqDividerModule, E2eDividerStateAndStyle, DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
