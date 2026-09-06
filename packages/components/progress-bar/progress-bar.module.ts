import { NgModule } from '@angular/core';
import { KbqProgressBar, KbqProgressBarCaption, KbqProgressBarText } from './progress-bar.component';

@NgModule({
    imports: [
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
