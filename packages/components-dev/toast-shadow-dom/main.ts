import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideKbqShadowDomOverlay } from '@koobiq/components/core';
import { KbqToastPosition, kbqToastConfigurationProvider } from '@koobiq/components/toast';
import { DevApp } from './module';

// `?container=shadow` routes overlays into the shadow root (the fix); anything else keeps the default CDK behavior
// (overlays escape to `document.body` — the bug). Defaults to the broken behavior so it is visible immediately.
const useShadowContainer = new URLSearchParams(globalThis.location.search).get('container') === 'shadow';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        kbqToastConfigurationProvider({ position: KbqToastPosition.TOP_RIGHT }),
        // Resolve the MFE root element lazily — it only exists in the DOM once Angular has bootstrapped it.
        ...(useShadowContainer ? provideKbqShadowDomOverlay(() => globalThis.document.querySelector('dev-app')) : [])
    ]
}).catch((error) => console.error(error));
