import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import {
    KbqLoaderOverlay,
    KbqLoaderOverlayCaption,
    KbqLoaderOverlayIndicator,
    KbqLoaderOverlayText
} from './loader-overlay.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule,
        KbqProgressSpinnerModule
    ],
    declarations: [
        KbqLoaderOverlay,
        KbqLoaderOverlayIndicator,
        KbqLoaderOverlayText,
        KbqLoaderOverlayCaption
    ],
    exports: [
        KbqLoaderOverlay,
        KbqLoaderOverlayIndicator,
        KbqLoaderOverlayText,
        KbqLoaderOverlayCaption
    ]
})
export class KbqLoaderOverlayModule {}
