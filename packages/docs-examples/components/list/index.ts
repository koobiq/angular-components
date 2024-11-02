import { NgModule } from '@angular/core';
import { ListActionButtonExample } from './list-action-button/list-action-button-example';
import { ListGroupsExample } from './list-groups/list-groups-example';
import { ListMultipleCheckboxExample } from './list-multiple-checkbox/list-multiple-checkbox-example';
import { ListMultipleKeyboardExample } from './list-multiple-keyboard/list-multiple-keyboard-example';
import { ListOverviewExample } from './list-overview/list-overview-example';

export {
    ListActionButtonExample,
    ListGroupsExample,
    ListMultipleCheckboxExample,
    ListMultipleKeyboardExample,
    ListOverviewExample
};

const EXAMPLES = [
    ListOverviewExample,
    ListMultipleCheckboxExample,
    ListMultipleKeyboardExample,
    ListGroupsExample,
    ListActionButtonExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ListExamplesModule {}
