import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export enum DocsLocale {
    En = 'en',
    Ru = 'ru'
}

export const DOCS_DEFAULT_LOCALE_CODE = DocsLocale.Ru;

@Injectable({ providedIn: 'root' })
export class DocsLocaleService {
    private readonly router = inject(Router);
    private readonly location = inject(Location);

    /** Current locale code. */
    private locale$ = new BehaviorSubject<string>(
        this.getLocaleFromURL(this.location.path()) || DOCS_DEFAULT_LOCALE_CODE
    );

    /** Returns the current locale code. */
    get locale(): string {
        return this.locale$.getValue();
    }

    /** A stream that emits the current locale code when it changes. */
    get changes(): Observable<string> {
        return this.locale$.asObservable();
    }

    /** Returns an array of all supported locale codes. */
    get supportedLocales(): string[] {
        return Object.values(DocsLocale);
    }

    /**
     * Sets the current locale code and emits the change to subscribers.
     * Updates URL with the new locale code, if URL doesn't contain locale, navigation will be skipped.
     */
    setLocale(locale: string): void {
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
    isSupportedLocale(locale: string): boolean {
        return this.supportedLocales.includes(locale);
    }

    /** Extracts the locale from the given URL if it is present and supported */
    getLocaleFromURL(url: string): string | null {
        const locale = url.split('/')[1];
        return locale && this.isSupportedLocale(locale) ? locale : null;
    }
}
