import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonDemoComponent {
    colors = KbqComponentColors;
    styles = KbqButtonStyles;
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqToolTipModule
    ],
    declarations: [ButtonDemoComponent],
    bootstrap: [ButtonDemoComponent]
})
export class DemoModule {}
