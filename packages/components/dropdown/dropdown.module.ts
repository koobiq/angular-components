import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqDropdownContent } from './dropdown-content.directive';
import { KbqDropdownItem } from './dropdown-item.component';
import { KBQ_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER, KbqDropdownTrigger } from './dropdown-trigger.directive';
import { KbqDropdown } from './dropdown.component';

@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        KbqIconModule,
    ],
    exports: [
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownTrigger,
        KbqDropdownContent,
    ],
    declarations: [
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownTrigger,
        KbqDropdownContent,
    ],
    providers: [KBQ_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class KbqDropdownModule {}
