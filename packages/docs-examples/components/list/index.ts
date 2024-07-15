import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule } from '@koobiq/components/list';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
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
    ListOverviewExample,
};

const EXAMPLES = [
    ListOverviewExample,
    ListMultipleCheckboxExample,
    ListMultipleKeyboardExample,
    ListGroupsExample,
    ListActionButtonExample,
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqListModule,
        KbqDropdownModule,
        KbqToolTipModule,
        KbqIconModule,
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
})
export class ListExamplesModule {}
