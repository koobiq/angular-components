import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DemoComponent {}

/* tslint:disable:max-classes-per-file */
@NgModule({
    declarations: [DemoComponent],
    imports: [BrowserModule],
    bootstrap: [DemoComponent],
})
export class DemoModule {}
