import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { PopoverCloseExample } from './popover-close/popover-close-example';
import { PopoverCommonExample } from './popover-common/popover-common-example';
import { PopoverContentExample } from './popover-content/popover-content-example';
import { PopoverHeaderExample } from './popover-header/popover-header-example';
import { PopoverHeightExample } from './popover-height/popover-height-example';
import { PopoverPlacementCenterExample } from './popover-placement-center/popover-placement-center-example';
import { PopoverPlacementEdgesExample } from './popover-placement-edges/popover-placement-edges-example';
import { PopoverScrollExample } from './popover-scroll/popover-scroll-example';
import { PopoverWidthExample } from './popover-width/popover-width-example';

export {
    PopoverCloseExample,
    PopoverCommonExample,
    PopoverContentExample,
    PopoverHeaderExample,
    PopoverHeightExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample,
    PopoverScrollExample,
    PopoverWidthExample
};

const EXAMPLES = [
    PopoverCommonExample,
    PopoverWidthExample,
    PopoverHeightExample,
    PopoverCloseExample,
    PopoverHeaderExample,
    PopoverContentExample,
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
        KbqLinkModule,
        KbqDlModule,
        KbqBadgeModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class PopoverExamplesModule {}
