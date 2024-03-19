// tslint:disable:no-console
import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

import { KbqLoaderOverlayModule } from '../../components/loader-overlay';


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
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
        CommonModule,
        KbqButtonModule,
        KbqProgressSpinnerModule,
        KbqLoaderOverlayModule
    ],
    declarations: [LoaderOverlayDemoComponent],
    bootstrap: [LoaderOverlayDemoComponent]
})
export class DemoModule {}
