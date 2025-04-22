import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';
import { DevThemeToggle } from '../theme-toggle';

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
        BrowserAnimationsModule,
        KbqIconModule,
        KbqBadgeModule,
        DevThemeToggle
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
