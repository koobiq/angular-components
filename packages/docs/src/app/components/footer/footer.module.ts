import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqLinkModule } from '@koobiq/components/link';

import { KbqIconModule } from '../../../../../components/icon';
import { VersionPickerModule } from '../version-picker';

import { FooterComponent } from './footer.component';


@NgModule({
    imports: [
        CommonModule,
        KbqIconModule,
        KbqLinkModule,
        KbqDropdownModule,
        VersionPickerModule
    ],
    exports: [FooterComponent],
    declarations: [FooterComponent]
})
export class FooterModule {}
