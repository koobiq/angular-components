import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqDropdownContent } from './dropdown-content.directive';
import { KbqDropdownItem } from './dropdown-item.component';
import { KbqDropdownTrigger } from './dropdown-trigger.directive';
import { KbqDropdown, KbqDropdownFooter, KbqDropdownStaticContent } from './dropdown.component';

@NgModule({
    imports: [
        OverlayModule,
        KbqIconModule,
        KbqDropdownStaticContent,
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownTrigger,
        KbqDropdownContent,
        KbqDropdownFooter
    ],
    exports: [
        KbqDropdown,
        KbqDropdownItem,
        KbqDropdownTrigger,
        KbqDropdownContent,
        KbqDropdownStaticContent,
        KbqDropdownFooter
    ]
})
export class KbqDropdownModule {}
