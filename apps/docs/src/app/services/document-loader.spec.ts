import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DocsDocumentLoader } from './document-loader';

describe(DocsDocumentLoader.name, () => {
    let loader: DocsDocumentLoader;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DocsDocumentLoader, provideHttpClient(), provideHttpClientTesting()]
        });

        loader = TestBed.inject(DocsDocumentLoader);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('makes a single HTTP request for repeated gets of the same URL', () => {
        const received: string[] = [];

        loader.get('/doc.html').subscribe((value) => received.push(value));
        loader.get('/doc.html').subscribe((value) => received.push(value));

        const requests = httpMock.match('/doc.html');

        expect(requests.length).toBe(1);
        requests[0].flush('<p>content</p>');

        expect(received).toEqual(['<p>content</p>', '<p>content</p>']);
    });

    it('re-fetches after an error instead of replaying the failure', () => {
        const errors: unknown[] = [];

        loader.get('/doc.html').subscribe({ error: (error) => errors.push(error) });
        httpMock.expectOne('/doc.html').flush('boom', { status: 500, statusText: 'Server Error' });

        expect(errors.length).toBe(1);

        // The cache entry was evicted on error, so the next subscriber triggers a fresh request.
        const values: string[] = [];

        loader.get('/doc.html').subscribe((value) => values.push(value));
        httpMock.expectOne('/doc.html').flush('<p>ok</p>');

        expect(values).toEqual(['<p>ok</p>']);
    });
});
