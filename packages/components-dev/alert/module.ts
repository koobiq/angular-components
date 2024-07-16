// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqButtonModule, KbqButtonStyles } from '../../components/button';
import { KbqIconModule } from '../../components/icon';
import { KbqLinkModule } from '../../components/link';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    colors = KbqComponentColors;
    alertColors = KbqAlertColors;
    alertStyles = KbqAlertStyles;
    style = KbqButtonStyles;
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqAlertModule,
        KbqIconModule,
        KbqButtonModule,
        KbqLinkModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
