// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    colors = KbqComponentColors;
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqFormFieldModule,
        KbqIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
