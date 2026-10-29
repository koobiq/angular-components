import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { DocsNextLocale } from '../data/site';

export interface DocsNextExampleFile {
    name: string;
    content: string;
}

/** A block of a compiled page, as `tools/docs-next/generate-content.ts` writes it. */
export type DocsNextContentBlock =
    | { kind: 'html'; html: string }
    | { kind: 'code'; language: string; content: string }
    | { kind: 'example'; id: string; title: string; files: DocsNextExampleFile[] };

/** Loads the static content compiled from the MDX of the current site. */
@Injectable({ providedIn: 'root' })
export class DocsNextContent {
    private readonly http = inject(HttpClient);
    private readonly cache = new Map<string, Observable<DocsNextContentBlock[] | null>>();

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
}
