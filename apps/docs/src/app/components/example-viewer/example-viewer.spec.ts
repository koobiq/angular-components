import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, map } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsExampleViewerComponent } from './example-viewer';

const provideDocsLocale = (locale: DocsLocale) => {
    const changes = new BehaviorSubject<DocsLocale>(locale);

    return {
        provide: DocsLocaleService,
        useValue: {
            get locale() {
                return changes.value;
            },
            changes: changes.asObservable(),
            isRuLocale: changes.pipe(map((value) => value === DocsLocale.Ru))
        }
    };
};

describe(DocsExampleViewerComponent.name, () => {
    let fixture: ComponentFixture<DocsExampleViewerComponent>;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [DocsExampleViewerComponent],
            providers: [provideDocsLocale(DocsLocale.En), provideHttpClient(), provideHttpClientTesting()]
        });

        fixture = TestBed.createComponent(DocsExampleViewerComponent);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('fetches and renders the document when documentUrl is set', () => {
        fixture.componentRef.setInput('documentUrl', 'docs-content/example.html');
        fixture.detectChanges();

        httpMock.expectOne('docs-content/example.html').flush('<p>rendered content</p>');
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('rendered content');
    });

    it('does not fetch when documentUrl is empty', () => {
        fixture.componentRef.setInput('documentUrl', '');
        fixture.detectChanges();

        httpMock.expectNone(() => true);
    });
});
