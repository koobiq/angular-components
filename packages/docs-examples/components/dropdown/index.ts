import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTitleModule } from '@koobiq/components/title';
import { DropdownNavigationWrapExample } from './dropdown-navigation-wrap/dropdown-navigation-wrap-example';
import { DropdownNestedExample } from './dropdown-nested/dropdown-nested-example';
import { DropdownOverviewExample } from './dropdown-overview/dropdown-overview-example';

export { DropdownNavigationWrapExample, DropdownNestedExample, DropdownOverviewExample };

const EXAMPLES = [
    DropdownNestedExample,
    DropdownOverviewExample,
    DropdownNavigationWrapExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqButtonModule,
        KbqCheckboxModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqLinkModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqTitleModule,
        KbqDividerModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DropdownExamplesModule {}
