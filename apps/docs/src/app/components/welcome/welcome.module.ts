import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

import { WelcomeComponent } from './welcome.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        KbqIconModule,
        KbqLinkModule,
        RouterModule
    ],
    exports: [WelcomeComponent],
    declarations: [WelcomeComponent]
})
export class WelcomeModule {}
