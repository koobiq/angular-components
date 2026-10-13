import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DevApp, devPageRoutes } from './module';

@Injectable()
export class DevCustomOverlayContainer extends OverlayContainer {
    getContainerElement(): HTMLElement {
        if (!this._containerElement) {
            this._createContainer();
        }

        this._containerElement.classList.add('DEV_CUSTOM_OVERLAY_CONTAINER');

        return this._containerElement;
    }
}

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        provideRouter(devPageRoutes),
        kbqLocaleServiceProvider(),
        { provide: OverlayContainer, useClass: DevCustomOverlayContainer }
    ]
}).catch((error) => console.error(error));
