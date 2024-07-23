import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss']
})
export class DemoComponent {}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
