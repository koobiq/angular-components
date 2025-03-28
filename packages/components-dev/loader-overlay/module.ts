import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { LoaderOverlayExamplesModule } from '../../docs-examples/components/loader-overlay';

@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LoaderOverlayDemoComponent {
    themePalette = ThemePalette;

    text = 'text text text text text text text text text text text text text text ';
    caption = 'caption caption caption caption caption caption caption caption ';

    loading = true;
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqButtonModule,
        KbqProgressSpinnerModule,
        KbqLoaderOverlayModule,
        LoaderOverlayExamplesModule
    ],
    declarations: [LoaderOverlayDemoComponent],
    bootstrap: [LoaderOverlayDemoComponent]
})
export class DemoModule {}
