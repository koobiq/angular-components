import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SCENARIOS } from './scenarios';
import { SmokeScenario } from './scenarios/smoke';

/** The page of each application: every scenario at once, for `ng serve` and for the bundle check. */
@Component({
    selector: 'check-app',
    imports: [SmokeScenario, ...SCENARIOS],
    template: `
        <check-smoke />
        <check-select />
        <check-tree-select />
        <check-autocomplete />
        <check-dropdown />
        <check-datepicker />
        <check-tooltip />
        <check-list />
        <check-navbar />
        <check-sidepanel />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckApp {}
