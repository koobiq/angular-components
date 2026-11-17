// Шапка сайта документации, не часть примера
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, createComponent } from '@angular/core';
import { DocsHeader } from './docs-header';

/** Creates the header and appends it to the `<docs-header>` element of `index.html`. */
export function docsMountHeader(appRef: ApplicationRef): void {
    const header = createComponent(DocsHeader, { environmentInjector: appRef.injector });

    appRef.attachView(header.hostView);
    appRef.injector.get(DOCUMENT).querySelector('docs-header')?.replaceWith(header.location.nativeElement);
}
