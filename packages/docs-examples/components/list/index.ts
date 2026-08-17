import { NgModule } from '@angular/core';
import { ListActionButtonExample } from './list-action-button/list-action-button-example';
import { ListDraggableConnectedExample } from './list-draggable-connected/list-draggable-connected-example';
import { ListDraggableExample } from './list-draggable/list-draggable-example';
import { ListGroupsExample } from './list-groups/list-groups-example';
import { ListIntermediateStateExample } from './list-intermediate-state/list-intermediate-state-example';
import { ListMultipleCheckboxExample } from './list-multiple-checkbox/list-multiple-checkbox-example';
import { ListMultipleKeyboardExample } from './list-multiple-keyboard/list-multiple-keyboard-example';
import { ListOverviewExample } from './list-overview/list-overview-example';
import { ListVirtualScrollExample } from './list-virtual-scroll/list-virtual-scroll-example';

export {
    ListActionButtonExample,
    ListDraggableConnectedExample,
    ListDraggableExample,
    ListGroupsExample,
    ListIntermediateStateExample,
    ListMultipleCheckboxExample,
    ListMultipleKeyboardExample,
    ListOverviewExample,
    ListVirtualScrollExample
};

const EXAMPLES = [
    ListOverviewExample,
    ListMultipleCheckboxExample,
    ListMultipleKeyboardExample,
    ListGroupsExample,
    ListActionButtonExample,
    ListIntermediateStateExample,
    ListVirtualScrollExample,
    ListDraggableExample,
    ListDraggableConnectedExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ListExamplesModule {}
