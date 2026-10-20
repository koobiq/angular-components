import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, ErrorHandler, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { DocsVersionPickerDirective } from './version-picker.directive';

const VERSIONS = {
    '18': { version: '18.39.5', date: '2026-06-01T09:36:28.529Z', url: 'https://v18.koobiq.io/' },
    '19': { version: '19.8.1', date: '2026-06-09T17:42:13.456Z', url: 'https://v19.koobiq.io/' },
    '20': { version: '20.0.0', date: '2026-06-17T16:18:32.278Z', url: 'https://v20.koobiq.io/' },
    next: { version: 'Next', url: 'https://next.koobiq.io' }
};

const PAGE = '/en/components/button/api?tab=1#inputs';

const sitemapOf = (host: string): string => `<urlset><url><loc>${host}/en/components/button/api</loc></url></urlset>`;

@Component({
    selector: 'docs-test-app',
    imports: [DocsVersionPickerDirective],
    template: '<div docsVersionPicker></div>'
})
class TestApp {
    readonly picker = viewChild.required(DocsVersionPickerDirective);
}

describe(DocsVersionPickerDirective.name, () => {
    let assign: jest.Mock;
    let handleError: jest.Mock;
    let httpMock: HttpTestingController;
    let picker: DocsVersionPickerDirective;

    const pick = (name: string): void => picker.goToVersion(picker.versions.find((version) => version.name === name)!);
    const failSitemaps = (): void =>
        httpMock
            .match((request) => request.url.endsWith('/sitemap.xml'))
            .forEach((request) => request.error(new ProgressEvent('error')));

    beforeEach(async () => {
        assign = jest.fn();
        handleError = jest.fn();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([{ path: '**', children: [] }]),
                { provide: ErrorHandler, useValue: { handleError } },
                { provide: KBQ_WINDOW, useValue: { location: { href: `https://next.koobiq.io${PAGE}`, assign } } }
            ]
        });
        httpMock = TestBed.inject(HttpTestingController);
        await TestBed.inject(Router).navigateByUrl(PAGE);

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        httpMock.expectOne('https://next.koobiq.io/assets/versions.json').flush(VERSIONS);
        picker = fixture.componentInstance.picker();
    });

    afterEach(() => {
        jest.useRealTimers();
        httpMock.verify();
    });

    it('opens the same page in the picked version', () => {
        pick('20');
        httpMock.expectOne('https://koobiq.io/sitemap.xml').flush(sitemapOf('https://koobiq.io'));

        expect(assign).toHaveBeenCalledWith(`https://koobiq.io${PAGE}`);
    });

    it('stays on the page when the current version is picked', () => {
        pick('next');

        expect(assign).not.toHaveBeenCalled();
    });

    it('opens the version picked last, whichever answers first', () => {
        pick('19');
        const first = httpMock.expectOne('https://v19.koobiq.io/sitemap.xml');

        pick('18');
        httpMock.expectOne('https://v18.koobiq.io/sitemap.xml').flush(sitemapOf('https://koobiq.io'));
        first.flush(sitemapOf('https://koobiq.io'));

        expect(assign).toHaveBeenCalledTimes(1);
        expect(assign).toHaveBeenCalledWith(`https://v18.koobiq.io${PAGE}`);
    });

    it('reads the sitemaps of the other versions once the dropdown opens, and once only', () => {
        picker.prefetch();
        const requests = ['https://v18.koobiq.io', 'https://v19.koobiq.io', 'https://koobiq.io'].map((host) =>
            httpMock.expectOne(`${host}/sitemap.xml`)
        );

        requests.forEach((request) => request.flush(sitemapOf('https://koobiq.io')));
        picker.prefetch();
        pick('19');

        expect(assign).toHaveBeenCalledWith(`https://v19.koobiq.io${PAGE}`);
    });

    it('opens the home page of a version whose sitemap it cannot read', () => {
        pick('19');
        httpMock.expectOne('https://v19.koobiq.io/sitemap.xml').error(new ProgressEvent('error'));

        expect(assign).toHaveBeenCalledWith('https://v19.koobiq.io/');
    });

    it('does not wait again for a sitemap the dropdown could not read', () => {
        picker.prefetch();
        failSitemaps();
        pick('19');

        expect(assign).toHaveBeenCalledWith('https://v19.koobiq.io/');
    });

    it('reads a sitemap it could not read again the next time the dropdown opens', () => {
        picker.prefetch();
        failSitemaps();
        picker.prefetch();
        httpMock
            .match((request) => request.url.endsWith('/sitemap.xml'))
            .forEach((request) => request.flush(sitemapOf('https://koobiq.io')));
        pick('19');

        expect(assign).toHaveBeenCalledWith(`https://v19.koobiq.io${PAGE}`);
    });

    it('opens the home page of a version whose sitemap does not answer in time', async () => {
        jest.useFakeTimers();

        pick('19');
        const request = httpMock.expectOne('https://v19.koobiq.io/sitemap.xml');

        await jest.advanceTimersByTimeAsync(3000);

        expect(request.cancelled).toBe(true);
        expect(assign).toHaveBeenCalledWith('https://v19.koobiq.io/');
    });

    it('reports a sitemap it cannot parse and still opens the version', () => {
        pick('19');
        httpMock
            .expectOne('https://v19.koobiq.io/sitemap.xml')
            .flush('<urlset><url><loc>https://[</loc></url></urlset>');

        // Thrown by the URL of the test environment, whose TypeError is not the one of this realm.
        expect(handleError).toHaveBeenCalledWith(expect.objectContaining({ name: 'TypeError' }));
        expect(assign).toHaveBeenCalledWith('https://v19.koobiq.io/');
    });
});
