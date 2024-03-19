import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

import { KbqIconModule } from '../../../../../components/icon';

import { WelcomeComponent } from './welcome.component';


@NgModule({
    imports: [
        CommonModule,
        KbqIconModule,
        KbqLinkModule
    ],
    exports: [WelcomeComponent],
    declarations: [WelcomeComponent]
})
export class WelcomeModule {}
