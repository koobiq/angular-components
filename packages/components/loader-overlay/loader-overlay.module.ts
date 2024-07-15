import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import {
    KbqLoaderOverlay,
    KbqLoaderOverlayCaption,
    KbqLoaderOverlayIndicator,
    KbqLoaderOverlayText,
} from './loader-overlay.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
        KbqProgressSpinnerModule,
    ],
    declarations: [
        KbqLoaderOverlay,
        KbqLoaderOverlayIndicator,
        KbqLoaderOverlayText,
        KbqLoaderOverlayCaption,
    ],
    exports: [
        KbqLoaderOverlay,
        KbqLoaderOverlayIndicator,
        KbqLoaderOverlayText,
        KbqLoaderOverlayCaption,
    ],
})
export class KbqLoaderOverlayModule {}
