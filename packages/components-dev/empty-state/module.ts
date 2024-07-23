import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponent {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
