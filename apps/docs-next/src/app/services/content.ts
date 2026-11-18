import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { DOCS_NEXT_COMPONENTS } from '../data/components';
import { DocsNextLocale } from '../data/site';

export interface DocsNextExampleFile {
    name: string;
    content: string;
}

/** A block of a compiled page, as `tools/docs-next/generate-content.ts` writes it. */
export type DocsNextContentBlock =
    | { kind: 'html'; html: string }
    | { kind: 'code'; language: string; content: string }
    /** The source files of an example are in `/content/<sources>.sources.json`, loaded when the code is opened. */
    | { kind: 'example'; id: string; title: string; sources?: string };

/** Loads the static content compiled from the MDX of the current site. */
@Injectable({ providedIn: 'root' })
export class DocsNextContent {
    private readonly http = inject(HttpClient);
    private readonly window = inject(KBQ_WINDOW);
    private readonly cache = new Map<string, Observable<DocsNextContentBlock[] | null>>();
    private readonly sourcesCache = new Map<string, Observable<Record<string, DocsNextExampleFile[]> | null>>();

    /**
     * Starts the load of the page a menu item leads to, when the pointer or the focus comes to it, so the page may be
     * there by the time it is opened; the cache keeps it. A connection that saves data does not get it.
     */
    prefetchItem(itemId: string, locale: DocsNextLocale): void {
        const connection = (this.window.navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        const [section, page] = itemId.split('/');

        if (connection?.saveData || !page) return;

        if (section === 'components') {
            if (DOCS_NEXT_COMPONENTS.find(({ id }) => id === page)?.angular)
                this.load('components', page, locale).subscribe();
        } else {
            this.load('pages', page, locale).subscribe();
        }
    }

    /** Blocks of a page, or `null` when the prototype has no article for it. */
    load(kind: 'components' | 'pages', id: string, locale: DocsNextLocale): Observable<DocsNextContentBlock[] | null> {
        const url = `/content/${kind}/${id}.${locale}.json`;

        if (!this.cache.has(url)) {
            this.cache.set(
                url,
                this.http.get<DocsNextContentBlock[]>(url).pipe(
                    catchError(() => of(null)),
                    shareReplay(1)
                )
            );
        }

        return this.cache.get(url)!;
    }

    /** The source files of the examples of a page, by example id, or `null` when they could not be loaded. */
    loadExampleSources(sources: string): Observable<Record<string, DocsNextExampleFile[]> | null> {
        if (!this.sourcesCache.has(sources)) {
            this.sourcesCache.set(
                sources,
                this.http.get<Record<string, DocsNextExampleFile[]>>(`/content/${sources}.sources.json`).pipe(
                    catchError(() => of(null)),
                    shareReplay(1)
                )
            );
        }

        return this.sourcesCache.get(sources)!;
    }
}
