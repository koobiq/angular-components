import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqDropdownContent } from './dropdown-content.directive';
import { KbqDropdownItem } from './dropdown-item.component';
import { KBQ_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER, KbqDropdownTrigger } from './dropdown-trigger.directive';
import { KbqDropdown, KbqDropdownStaticContent } from './dropdown.component';

@NgModule({
    imports: [
        OverlayModule,
        KbqIconModule,
        NgClass,
        KbqDropdownStaticContent,
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownTrigger,
        KbqDropdownContent
    ],
    exports: [
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownTrigger,
        KbqDropdownContent,
        KbqDropdownStaticContent
    ],
    providers: [KBQ_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class KbqDropdownModule {}
