import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqDividerModule } from '@koobiq/components/divider';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqDividerModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
