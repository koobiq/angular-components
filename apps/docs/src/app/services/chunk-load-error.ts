import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';

/** What Chromium, Safari and Firefox report when a dynamic import cannot load its chunk. */
const CHUNK_LOAD_ERROR =
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/;

/**
 * Loads the page of a failed navigation in full when its chunk is gone. A tab opened before a deploy still asks
 * for the chunks of the previous build, while the page served now names the current ones. Only after the first
 * navigation has succeeded: a chunk missing from the build itself would otherwise reload the page forever.
 */
export const docsReloadOnChunkLoadError = ({ error, url }: NavigationError): void => {
    if (
        !isPlatformBrowser(inject(PLATFORM_ID)) ||
        !inject(Router).navigated ||
        !(error instanceof Error) ||
        !CHUNK_LOAD_ERROR.test(error.message)
    ) {
        return;
    }

    inject(KBQ_WINDOW).location.assign(url);
};
