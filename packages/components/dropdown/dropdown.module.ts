import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqDropdownContent } from './dropdown-content.directive';
import { KbqDropdownItemAction } from './dropdown-item-action';
import { KbqDropdownItem } from './dropdown-item.component';
import { KbqDropdownSearch } from './dropdown-search';
import { KbqDropdownTrigger } from './dropdown-trigger.directive';
import { KbqDropdown, KbqDropdownFooter, KbqDropdownStaticContent } from './dropdown.component';

@NgModule({
    imports: [
        OverlayModule,
        KbqIconModule,
        KbqDropdownStaticContent,
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownItemAction,
        KbqDropdownTrigger,
        KbqDropdownContent,
        KbqDropdownFooter,
        KbqDropdownSearch
    ],
    exports: [
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownItemAction,
        KbqDropdownTrigger,
        KbqDropdownContent,
        KbqDropdownStaticContent,
        KbqDropdownFooter,
        KbqDropdownSearch
    ]
})
export class KbqDropdownModule {}
