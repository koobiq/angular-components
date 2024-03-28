import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    KbqProgressBar,
    KbqProgressBarText,
    KbqProgressBarCaption
} from './progress-bar.component';


@NgModule({
    imports: [
        CommonModule,
        PlatformModule
    ],
    declarations: [
        KbqProgressBar,
        KbqProgressBarText,
        KbqProgressBarCaption
    ],
    exports: [
        KbqProgressBar,
        KbqProgressBarText,
        KbqProgressBarCaption
    ]
})
export class KbqProgressBarModule {}
