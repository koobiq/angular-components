import { TestBed } from '@angular/core/testing';
import { NavigationError, provideRouter, Router } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { docsReloadOnChunkLoadError } from './chunk-load-error';

const TARGET_URL = '/en/components/button/overview';

describe('docsReloadOnChunkLoadError', () => {
    let assign: jest.Mock;

    const handle = (error: unknown): void =>
        TestBed.runInInjectionContext(() => docsReloadOnChunkLoadError(new NavigationError(1, TARGET_URL, error)));

    beforeEach(() => {
        assign = jest.fn();
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: KBQ_WINDOW, useValue: { location: { assign } } }]
        });
    });

    it('loads the page in full when its chunk is gone after a deploy', () => {
        TestBed.inject(Router).navigated = true;

        handle(
            new TypeError('Failed to fetch dynamically imported module: https://koobiq.io/button.en.page-KRULY4YM.js')
        );

        expect(assign).toHaveBeenCalledWith(TARGET_URL);
    });

    it('leaves other navigation errors to the router', () => {
        TestBed.inject(Router).navigated = true;

        handle(new Error('The resolver failed'));

        expect(assign).not.toHaveBeenCalled();
    });

    // A chunk missing from the build itself fails the first navigation too, and reloading would repeat it forever.
    it('does not reload before the first navigation has succeeded', () => {
        handle(new TypeError('Importing a module script failed.'));

        expect(assign).not.toHaveBeenCalled();
    });
});
