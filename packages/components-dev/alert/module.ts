import { Component, computed, model, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KbqButtonModule, KbqButtonStyles } from '../../components/button';
import { KbqIconModule } from '../../components/icon';
import { KbqLinkModule } from '../../components/link';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    colors = KbqComponentColors;
    alertColors = KbqAlertColors;
    alertStyles = KbqAlertStyles;
    style = KbqButtonStyles;

    isColored = model(false);
    alertStyle = computed(() => (this.isColored() ? this.alertStyles.Colored : this.alertStyles.Default));
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqAlertModule,
        KbqIconModule,
        KbqButtonModule,
        KbqLinkModule,
        FormsModule,
        KbqToggleModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
