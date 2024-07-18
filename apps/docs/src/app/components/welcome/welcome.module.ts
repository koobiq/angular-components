import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { AnchorsModule } from '../anchors/anchors.module';
import { WelcomeComponent } from './welcome.component';

@NgModule({
    imports: [
        AnchorsModule,
        CommonModule,
        KbqIconModule,
        KbqLinkModule,
        RouterModule
    ],
    exports: [WelcomeComponent],
    declarations: [WelcomeComponent]
})
export class WelcomeModule {}
