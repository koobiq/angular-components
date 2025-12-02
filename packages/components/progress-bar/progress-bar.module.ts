import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqProgressBar, KbqProgressBarCaption, KbqProgressBarText } from './progress-bar.component';

@NgModule({
    imports: [
        PlatformModule,
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
