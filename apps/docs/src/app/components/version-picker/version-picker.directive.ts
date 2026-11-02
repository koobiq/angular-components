import { HttpClient } from '@angular/common/http';
import { afterNextRender, ChangeDetectorRef, DestroyRef, Directive, ErrorHandler, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { catchError, map, Observable, of, shareReplay, Subscription, timeout } from 'rxjs';
import { docsGetVersionPageUrl, docsGetVersionSitemapUrl, docsParseSitemapPaths } from './version-url';

/** How long a picked version waits for its sitemap before the reader is taken to its home page. */
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
    private readonly router = inject(Router);
    private readonly errorHandler = inject(ErrorHandler);
    private readonly destroyRef = inject(DestroyRef);

    /** Pages of each version read so far, by version URL. */
    private readonly pagePaths = new Map<string, Observable<Set<string> | null>>();
    /** Versions whose sitemap could not be read, tried again the next time the dropdown opens. */
    private readonly failed = new Set<string>();
    private navigation = Subscription.EMPTY;

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

    /** Starts reading the pages of the other versions, so that picking one does not wait for them. */
    prefetch(): void {
        this.failed.forEach((url) => this.pagePaths.delete(url));
        this.failed.clear();

        this.versions
            .filter(({ selected }) => !selected)
            .forEach(({ url }) => this.getPagePaths(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe());
    }

    /** Opens the page the reader is on in the given version, or the closest page that version has. */
    goToVersion(version: DocsVersion): void {
        if (version.selected) return;

        // The version picked last wins, whichever answers first.
        this.navigation.unsubscribe();
        this.navigation = this.getPagePaths(version.url)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((pagePaths) =>
                this.window.location.assign(docsGetVersionPageUrl(this.router.url, version.url, pagePaths))
            );
    }

    private getPagePaths(versionUrl: string): Observable<Set<string> | null> {
        let pagePaths = this.pagePaths.get(versionUrl);

        if (!pagePaths) {
            pagePaths = this.httpClient.get(docsGetVersionSitemapUrl(versionUrl), { responseType: 'text' }).pipe(
                timeout(SITEMAP_TIMEOUT),
                // Unreachable, too slow, or not shared with other origins, like a version deployed before it was:
                // nothing to check the page against. Kept, so that a pick does not wait for it again.
                catchError(() => {
                    this.failed.add(versionUrl);

                    return of(null);
                }),
                map((sitemap) => (sitemap === null ? null : docsParseSitemapPaths(sitemap))),
                // A sitemap that does not parse is a bug to hear about, but the reader still gets to the version.
                catchError((error: unknown) => {
                    this.errorHandler.handleError(error);

                    return of(null);
                }),
                shareReplay(1)
            );
            this.pagePaths.set(versionUrl, pagePaths);
        }

        return pagePaths;
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
