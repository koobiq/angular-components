import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { VersionPickerDirective } from './version-picker.directive';

@NgModule({
    imports: [
        CommonModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqIconModule,
    ],
    exports: [VersionPickerDirective],
    declarations: [VersionPickerDirective],
})
export class VersionPickerModule {}
