import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqTableModule } from '@koobiq/components/table';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        KbqTableModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
