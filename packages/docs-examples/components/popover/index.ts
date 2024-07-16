import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { PopoverCommonExample } from './popover-common/popover-common-example';
import { PopoverPlacementCenterExample } from './popover-placement-center/popover-placement-center-example';
import { PopoverPlacementEdgesExample } from './popover-placement-edges/popover-placement-edges-example';
import { PopoverScrollExample } from './popover-scroll/popover-scroll-example';

export { PopoverCommonExample, PopoverPlacementCenterExample, PopoverPlacementEdgesExample, PopoverScrollExample };

const EXAMPLES = [
    PopoverCommonExample,
    PopoverScrollExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample
];

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        FormsModule,
        KbqFormsModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqIconModule,
        KbqInputModule,
        KbqCheckboxModule,
        KbqRadioModule,
        KbqLinkModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class PopoverExamplesModule {}
