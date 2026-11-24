import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqDropdown, KbqDropdownFooter, KbqDropdownGroupHeader, KbqDropdownStaticContent } from './dropdown.component';
import { KbqDropdownContent } from './dropdown-content.directive';
import { KbqDropdownItem, KbqDropdownItemCaption } from './dropdown-item.component';
import { KbqDropdownItemAction } from './dropdown-item-action';
import { KbqDropdownSearch } from './dropdown-search';
import { KbqDropdownTrigger } from './dropdown-trigger.directive';

@NgModule({
    imports: [
        OverlayModule,
        KbqIconModule,
        KbqDropdownStaticContent,
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownItemCaption,
        KbqDropdownItemAction,
        KbqDropdownTrigger,
        KbqDropdownContent,
        KbqDropdownFooter,
        KbqDropdownGroupHeader,
        KbqDropdownSearch
    ],
    exports: [
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownItemCaption,
        KbqDropdownItemAction,
        KbqDropdownTrigger,
        KbqDropdownContent,
        KbqDropdownStaticContent,
        KbqDropdownFooter,
        KbqDropdownGroupHeader,
        KbqDropdownSearch
    ]
})
export class KbqDropdownModule {}
