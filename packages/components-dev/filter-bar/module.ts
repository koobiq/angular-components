import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqFilterBarModule } from '@koobiq/components/filter-bar';
import { KbqIconModule } from '@koobiq/components/icon';

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
        BrowserAnimationsModule,
        KbqIconModule,
        KbqFilterBarModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
