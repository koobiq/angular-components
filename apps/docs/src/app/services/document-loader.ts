import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DocsDocumentLoader {
    private readonly cache = new Map<string, Observable<string>>();
    private readonly httpClient = inject(HttpClient);

    /**
     * Fetches a document from the given URL.
     * Caches the result to avoid multiple HTTP requests for the same URL.
     * @param url The URL of the document to fetch.
     * @returns An Observable that emits the document content as a string.
     */
    get(url: string): Observable<string> {
        if (!this.cache.has(url)) {
            this.cache.set(url, this.httpClient.get(url, { responseType: 'text' }).pipe(shareReplay(1)));
        }

        return this.cache.get(url)!;
    }
}
