import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { DevApp, DevPage1, DevPage2 } from './module';

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
        provideRouter([
            { path: '', redirectTo: 'page-1', pathMatch: 'full' },
            { path: 'page-1', component: DevPage1 },
            { path: 'page-2', component: DevPage2 }
        ]),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
        { provide: OverlayContainer, useClass: DevCustomOverlayContainer }
    ]
}).catch((error) => console.error(error));
