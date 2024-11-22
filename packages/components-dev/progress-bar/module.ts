import { Component, NgModule, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressBarModule, ProgressBarMode } from '../../components/progress-bar/';

const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

@Component({
    selector: 'app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss']
})
export class ProgressBarDemoComponent implements OnDestroy {
    themePalette = ThemePalette;
    mode: ProgressBarMode = 'determinate';
    percent: number = 0;
    intervalId: number;

    constructor() {
        setInterval(() => (this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP)), INTERVAL);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }
}

@NgModule({
    declarations: [ProgressBarDemoComponent],
    imports: [
        BrowserModule,
        KbqProgressBarModule,
        FormsModule
    ],
    bootstrap: [ProgressBarDemoComponent]
})
export class DemoModule {}
