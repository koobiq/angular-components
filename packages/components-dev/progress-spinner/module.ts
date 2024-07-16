import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqProgressSpinnerModule, ProgressSpinnerMode } from '@koobiq/components/progress-spinner';

const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

@Component({
    selector: 'app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['../main.scss', './styles.scss']
})
export class ProgressSpinnerDemoComponent implements OnDestroy {
    colors = KbqComponentColors;

    mode: ProgressSpinnerMode = 'determinate';
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
    declarations: [
        ProgressSpinnerDemoComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        KbqProgressSpinnerModule,
        FormsModule
    ],
    bootstrap: [
        ProgressSpinnerDemoComponent
    ]
})
export class DemoModule {}
