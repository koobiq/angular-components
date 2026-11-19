import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DevApp, devPageRoutes } from './module';

@Injectable()
export class DevCustomOverlayContainer extends OverlayContainer {
    override getContainerElement(): HTMLElement {
        const container = super.getContainerElement();

        container.classList.add('DEV_CUSTOM_OVERLAY_CONTAINER');

        return container;
    }
}

bootstrapApplication(DevApp, {
    providers: [
        provideRouter(devPageRoutes),
        kbqLocaleServiceProvider(),
        { provide: OverlayContainer, useClass: DevCustomOverlayContainer }
    ]
}).catch((error) => console.error(error));
