import { HttpClient } from '@angular/common/http';
import { afterNextRender, ChangeDetectorRef, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { catchError, map, of, timeout } from 'rxjs';
import { docsGetVersionPageUrl, docsParseSitemapPaths } from './version-url';

/** How long a click on a version waits for its sitemap before it opens the home page of that version. */
const SITEMAP_TIMEOUT = 3000;

type DocsVersion = {
    version: string;
    date: string;
    url: string;
    selected: boolean;
    name: string;
    latest: boolean;
};

@Directive({
    selector: '[docsVersionPicker]',
    exportAs: 'docsVersionPicker'
})
export class DocsVersionPickerDirective {
    selected: DocsVersion;
    versions: DocsVersion[] = [];
    isNext: boolean = false;

    private readonly httpClient = inject(HttpClient);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly window = inject(KBQ_WINDOW);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        // Fetches an external, non-local URL: must never run during SSR/prerendering, or a
        // stalled connection to it blocks zone stabilization until the render worker's hardcoded
        // 30s timeout kills the whole prerender batch. `afterNextRender` only runs in the browser.
        afterNextRender(() => this.init());
    }

    private init(): void {
        this.httpClient
            .get('https://next.koobiq.io/assets/versions.json', { responseType: 'json' })
            .pipe(
                // A failed version fetch must not throw an unhandled error; degrade gracefully to
                // an empty version list (the picker simply shows no alternative versions).
                catchError(() => of({})),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((data) => {
                Object.entries(data)
                    .reverse()
                    .forEach(([name, value], index) => {
                        if (index === 1) {
                            value.url = 'https://koobiq.io/';
                            value.latest = true;
                        }

                        if (name === 'next' || parseInt(name) >= 8) {
                            this.versions.push({ name, selected: false, ...value });
                        }
                    });

                this.setSelectedVersion();

                this.changeDetectorRef.markForCheck();
            });
    }

    /** Opens the page the reader is on in the given version, or the closest page that version has. */
    goToVersion(version: DocsVersion): void {
        if (version.selected) return;

        this.httpClient
            .get(new URL('/sitemap.xml', version.url).href, { responseType: 'text' })
            .pipe(
                timeout(SITEMAP_TIMEOUT),
                map(docsParseSitemapPaths),
                // A version deployed before its sitemap was shared with other origins cannot be checked: its home page.
                catchError(() => of(null)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((pagePaths) =>
                this.window.location.assign(docsGetVersionPageUrl(this.window.location, version.url, pagePaths))
            );
    }

    private setSelectedVersion(): void {
        this.versions.forEach((version, index) => {
            if (this.window.location.href.startsWith(version.url)) {
                version.selected = true;

                this.selected = version;
                this.isNext = index === 0;
            }
        });
    }
}
