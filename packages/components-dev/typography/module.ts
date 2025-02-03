import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TypographyExamplesModule } from '../../docs-examples/components/typography';

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
        TypographyExamplesModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
