import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    AlertCloseExample,
    AlertContentExample,
    AlertDynamicExample,
    AlertOverviewExample,
    AlertStatusExample,
    AlertVariantsExample
} from 'packages/docs-examples/components/alert';
import { E2eAlertStateAndStyle } from '../../components/alert/e2e';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        AlertOverviewExample,
        AlertVariantsExample,
        AlertStatusExample,
        AlertCloseExample,
        AlertContentExample,
        AlertDynamicExample
    ],
    template: `
        <alert-overview-example />
        <hr />
        <alert-variants-example />
        <hr />
        <alert-status-example />
        <hr />
        <alert-close-example />
        <hr />
        <alert-content-example />
        <hr />
        <alert-dynamic-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [E2eAlertStateAndStyle, DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
