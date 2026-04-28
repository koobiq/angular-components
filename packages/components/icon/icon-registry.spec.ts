import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqIconRegistry } from './icon-registry';

const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>';
const SPRITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="check_16" viewBox="0 0 16 16"><path d="M1 8l4 4 8-8"/></symbol>
  <symbol id="close_16" viewBox="0 0 16 16"><path d="M2 2l12 12M14 2L2 14"/></symbol>
</svg>`;

describe('KbqIconRegistry', () => {
    let registry: KbqIconRegistry;
    let sanitizer: DomSanitizer;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });

        registry = TestBed.inject(KbqIconRegistry);
        sanitizer = TestBed.inject(DomSanitizer);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    describe('addSvgIconLiteral', () => {
        it('returns cloned SVGElement', (done) => {
            registry.addSvgIconLiteral('check', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            registry.getNamedSvgIcon('check').subscribe((svg) => {
                expect(svg).toBeInstanceOf(SVGElement);
                expect(svg.tagName.toLowerCase()).toBe('svg');
                done();
            });
        });

        it('returns distinct clones per call', (done) => {
            registry.addSvgIconLiteral('check', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            const results: SVGElement[] = [];

            registry.getNamedSvgIcon('check').subscribe((svg) => results.push(svg));
            registry.getNamedSvgIcon('check').subscribe((svg) => {
                results.push(svg);
                expect(results[0]).not.toBe(results[1]);
                done();
            });
        });
    });

    describe('addSvgIconLiteralInNamespace', () => {
        it('resolves by explicit namespace arg', (done) => {
            registry.addSvgIconLiteralInNamespace('brand', 'logo', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            registry.getNamedSvgIcon('logo', 'brand').subscribe((svg) => {
                expect(svg).toBeInstanceOf(SVGElement);
                done();
            });
        });

        it('resolves by "ns:name" syntax', (done) => {
            registry.addSvgIconLiteralInNamespace('brand', 'logo', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            registry.getNamedSvgIcon('brand:logo').subscribe((svg) => {
                expect(svg).toBeInstanceOf(SVGElement);
                done();
            });
        });

        it('does not resolve in wrong namespace', (done) => {
            registry.addSvgIconLiteralInNamespace('brand', 'logo', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            registry.getNamedSvgIcon('logo', 'other').subscribe({
                next: () => done.fail('should not emit'),
                error: () => done()
            });
        });
    });

    describe('addSvgIcon (URL)', () => {
        it('fetches and returns SVGElement', (done) => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/icons/check.svg');

            registry.addSvgIcon('check', url);

            registry.getNamedSvgIcon('check').subscribe((svg) => {
                expect(svg).toBeInstanceOf(SVGElement);
                done();
            });

            http.expectOne('/icons/check.svg').flush(ICON_SVG);
        });

        it('dedupes concurrent requests for same URL', () => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/icons/check.svg');

            registry.addSvgIcon('check', url);

            registry.getNamedSvgIcon('check').subscribe();
            registry.getNamedSvgIcon('check').subscribe();

            http.expectOne('/icons/check.svg').flush(ICON_SVG);
        });
    });

    describe('addSvgIconSet', () => {
        it('extracts named symbol from sprite', (done) => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg');

            registry.addSvgIconSet(url);

            registry.getNamedSvgIcon('check_16').subscribe((svg) => {
                expect(svg).toBeInstanceOf(SVGElement);
                expect(svg.getAttribute('viewBox')).toBe('0 0 16 16');
                done();
            });

            http.expectOne('/sprite.svg').flush(SPRITE_SVG);
        });

        it('errors for unknown name in set', (done) => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg');

            registry.addSvgIconSet(url);

            registry.getNamedSvgIcon('nonexistent_16').subscribe({
                next: () => done.fail('should not emit'),
                error: () => done()
            });

            http.expectOne('/sprite.svg').flush(SPRITE_SVG);
        });

        it('does not register same URL twice', () => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg');

            registry.addSvgIconSet(url);
            registry.addSvgIconSet(url);

            registry.getNamedSvgIcon('check_16').subscribe();

            // Only one HTTP request despite two addSvgIconSet calls.
            http.expectOne('/sprite.svg').flush(SPRITE_SVG);
        });
    });

    describe('addSvgIconSetInNamespace', () => {
        it('resolves symbol from namespaced set', (done) => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg');

            registry.addSvgIconSetInNamespace('kbq', url);

            registry.getNamedSvgIcon('check_16', 'kbq').subscribe((svg) => {
                expect(svg).toBeInstanceOf(SVGElement);
                done();
            });

            http.expectOne('/sprite.svg').flush(SPRITE_SVG);
        });
    });

    describe('getNamedSvgIcon errors', () => {
        it('errors when no icon registered', (done) => {
            registry.getNamedSvgIcon('missing').subscribe({
                next: () => done.fail('should not emit'),
                error: (err: Error) => {
                    expect(err.message).toContain('missing');
                    done();
                }
            });
        });
    });
});
