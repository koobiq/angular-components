// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    protected readonly colors = KbqComponentColors;
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqTableModule,
        KbqButtonModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
