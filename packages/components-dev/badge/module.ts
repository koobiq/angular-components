import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    colors = KbqBadgeColors;
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqIconModule,
        KbqBadgeModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
