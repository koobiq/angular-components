import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '@koobiq/components/core';
import type { Mock } from 'vitest';
import { DocsVersionPickerDirective } from './version-picker.directive';

const VERSIONS = {
    '19': { version: '19.8.1', date: '2026-06-09T17:42:13.456Z', url: 'https://v19.koobiq.io/' },
    '20': { version: '20.0.0', date: '2026-06-17T16:18:32.278Z', url: 'https://v20.koobiq.io/' },
    next: { version: 'Next', url: 'https://next.koobiq.io' }
};

@Component({
    selector: 'docs-test-app',
    imports: [DocsVersionPickerDirective],
    template: '<div docsVersionPicker></div>'
})
class TestApp {
    readonly picker = viewChild.required(DocsVersionPickerDirective);
}

describe(DocsVersionPickerDirective.name, () => {
    let assign: Mock;
    let httpMock: HttpTestingController;
    let picker: DocsVersionPickerDirective;

    const pick = (name: string): void => picker.goToVersion(picker.versions.find((version) => version.name === name)!);

    beforeEach(async () => {
        const { href, pathname, search, hash } = new URL(
            'https://next.koobiq.io/en/components/button/api?tab=1#inputs'
        );

        assign = vi.fn();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: KBQ_WINDOW, useValue: { location: { href, pathname, search, hash, assign } } }
            ]
        });
        httpMock = TestBed.inject(HttpTestingController);

        const fixture = TestBed.createComponent(TestApp);

        await fixture.whenStable();
        httpMock.expectOne('https://next.koobiq.io/assets/versions.json').flush(VERSIONS);
        picker = fixture.componentInstance.picker();
    });

    afterEach(() => httpMock.verify());

    it('opens the same page in the picked version', () => {
        pick('20');
        httpMock
            .expectOne('https://koobiq.io/sitemap.xml')
            .flush('<urlset><url><loc>https://koobiq.io/en/components/button/api</loc></url></urlset>');

        expect(assign).toHaveBeenCalledWith('https://koobiq.io/en/components/button/api?tab=1#inputs');
    });

    it('stays on the page when the current version is picked', () => {
        pick('next');

        expect(assign).not.toHaveBeenCalled();
    });

    it('opens the home page of a version whose sitemap it cannot read', () => {
        pick('19');
        httpMock.expectOne('https://v19.koobiq.io/sitemap.xml').error(new ProgressEvent('error'));

        expect(assign).toHaveBeenCalledWith('https://v19.koobiq.io/');
    });

    it('opens the home page of a version whose sitemap does not answer in time', async () => {
        // The async scheduler of rxjs runs its delays on intervals.
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });

        pick('19');
        const request = httpMock.expectOne('https://v19.koobiq.io/sitemap.xml');

        await vi.advanceTimersByTimeAsync(3000);
        vi.useRealTimers();

        expect(request.cancelled).toBe(true);
        expect(assign).toHaveBeenCalledWith('https://v19.koobiq.io/');
    });
});
