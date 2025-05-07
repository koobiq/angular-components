import { DOCUMENT, Location } from '@angular/common';
import { Directive, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { DOCS_DEFAULT_LOCALE, DOCS_SUPPORTED_LOCALES, DocsLocale } from '../constants/locale';

export const isRuLocale = (locale: DocsLocale): boolean => locale === DocsLocale.Ru;

@Injectable({ providedIn: 'root' })
export class DocsLocaleService {
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly document = inject(DOCUMENT);

    /** Current locale code. */
    private readonly locale$ = new BehaviorSubject<DocsLocale>(
        this.getLocaleFromURL(this.location.path()) || DOCS_DEFAULT_LOCALE
    );

    /** Returns the current locale code. */
    get locale(): DocsLocale {
        return this.locale$.getValue();
    }

    /** A stream that emits the current locale code when it changes. */
    get changes(): Observable<DocsLocale> {
        return this.locale$.asObservable();
    }

    /** A stream that emits whether the current locale is Russian. */
    get isRuLocale(): Observable<boolean> {
        return this.changes.pipe(map(isRuLocale));
    }

    /**
     * Sets the current locale code and emits the change to subscribers.
     * Updates URL with the new locale code, if URL doesn't contain locale, navigation will be skipped.
     */
    setLocale(locale: DocsLocale): void {
        if (!this.isSupportedLocale(locale)) {
            throw new Error(`[DocsLocaleService] Unsupported locale: ${locale}`);
        }

        this.document.documentElement.lang = locale;

        this.locale$.next(locale);

        // should update only URL which contain locale
        // e.g. - /ru/icons -> /en/icons
        // but not /404 -> /en
        if (this.getLocaleFromURL(this.router.url)) {
            const path = this.router.url.split('/');

            // replace language in path
            path[1] = locale;
            this.router.navigate(path);
        }
    }

    /** Checks if a given locale code is supported. */
    isSupportedLocale(locale: string): locale is DocsLocale {
        return DOCS_SUPPORTED_LOCALES.includes(locale);
    }

    /** Extracts the locale from the given URL if it is present and supported */
    getLocaleFromURL(url: string): DocsLocale | null {
        const locale = url.split('/')[1];

        return locale && this.isSupportedLocale(locale) ? locale : null;
    }
}

@Directive()
export class DocsLocaleState {
    readonly docsLocaleService = inject(DocsLocaleService);
    readonly isRuLocale = toSignal(this.docsLocaleService.isRuLocale, { initialValue: true });
    readonly locale = toSignal(this.docsLocaleService.changes, { initialValue: this.docsLocaleService.locale });
}
