import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import type { MockInstance } from 'vitest';
import { KbqIconRegistry } from './icon-registry';
import { kbqIconsDictProvider, kbqIconsProvider } from './icon-registry-providers';

const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>';
const SPRITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="check_16" viewBox="0 0 16 16"><path d="M1 8l4 4 8-8"/></symbol>
  <symbol id="close_16" viewBox="0 0 16 16"><path d="M2 2l12 12M14 2L2 14"/></symbol>
  <symbol id="3d-view_16" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></symbol>
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
        it('returns cloned SVGElement', async () => {
            registry.addSvgIconLiteral('check', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            const svg = await firstValueFrom(registry.getNamedSvgIcon('check'));

            expect(svg).toBeInstanceOf(SVGElement);
            expect(svg.tagName.toLowerCase()).toBe('svg');
        });

        it('returns distinct clones per call', async () => {
            registry.addSvgIconLiteral('check', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            const first = await firstValueFrom(registry.getNamedSvgIcon('check'));
            const second = await firstValueFrom(registry.getNamedSvgIcon('check'));

            expect(first).not.toBe(second);
        });
    });

    describe('addSvgIconLiteralInNamespace', () => {
        it('resolves by explicit namespace arg', async () => {
            registry.addSvgIconLiteralInNamespace('brand', 'logo', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            expect(await firstValueFrom(registry.getNamedSvgIcon('logo', 'brand'))).toBeInstanceOf(SVGElement);
        });

        it('resolves by "ns:name" syntax', async () => {
            registry.addSvgIconLiteralInNamespace('brand', 'logo', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            expect(await firstValueFrom(registry.getNamedSvgIcon('brand:logo'))).toBeInstanceOf(SVGElement);
        });

        it('does not resolve in wrong namespace', async () => {
            registry.addSvgIconLiteralInNamespace('brand', 'logo', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            await expect(firstValueFrom(registry.getNamedSvgIcon('logo', 'other'))).rejects.toBeInstanceOf(Error);
        });
    });

    describe('addSvgIcon (URL)', () => {
        it('fetches and returns SVGElement', async () => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/icons/check.svg');

            registry.addSvgIcon('check', url);

            const svg = firstValueFrom(registry.getNamedSvgIcon('check'));

            http.expectOne('/icons/check.svg').flush(ICON_SVG);

            expect(await svg).toBeInstanceOf(SVGElement);
        });

        it('dedupes concurrent requests for same URL', () => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/icons/check.svg');

            registry.addSvgIcon('check', url);

            registry.getNamedSvgIcon('check').subscribe();
            registry.getNamedSvgIcon('check').subscribe();

            const requests = http.match('/icons/check.svg');

            expect(requests).toHaveLength(1);
            requests[0].flush(ICON_SVG);
        });
    });

    describe('addSvgIconSet', () => {
        it('extracts named symbol from sprite', async () => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg');

            registry.addSvgIconSet(url);

            const icon = firstValueFrom(registry.getNamedSvgIcon('check_16'));

            http.expectOne('/sprite.svg').flush(SPRITE_SVG);

            const svg = await icon;

            expect(svg).toBeInstanceOf(SVGElement);
            expect(svg.getAttribute('viewBox')).toBe('0 0 16 16');
        });

        it('errors for unknown name in set', async () => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg');

            registry.addSvgIconSet(url);

            const icon = firstValueFrom(registry.getNamedSvgIcon('nonexistent_16'));

            http.expectOne('/sprite.svg').flush(SPRITE_SVG);

            await expect(icon).rejects.toBeInstanceOf(Error);
        });

        it('does not register same URL twice', () => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg');

            registry.addSvgIconSet(url);
            registry.addSvgIconSet(url);

            // An icon missing from the sprite makes the registry try every registered set in turn, so a
            // second registration of the URL would fetch it again.
            registry.getNamedSvgIcon('missing_16').subscribe({ error: () => undefined });

            http.expectOne('/sprite.svg').flush(SPRITE_SVG);

            expect(http.match('/sprite.svg')).toHaveLength(0);
        });

        // Symbol ids come from the consumer's sprite, so they are not guaranteed to be valid CSS
        // identifiers. Looked up as `#${name}`, a leading digit would be a selector syntax error, and
        // the icon would never resolve.
        it('extracts a symbol whose id is not a valid CSS identifier', async () => {
            registry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg'));

            const icon = firstValueFrom(registry.getNamedSvgIcon('3d-view_16'));

            http.expectOne('/sprite.svg').flush(SPRITE_SVG);

            expect(await icon).toBeInstanceOf(SVGElement);
        });
    });

    describe('addSvgIconSetInNamespace', () => {
        it('resolves symbol from namespaced set', async () => {
            const url = sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg');

            registry.addSvgIconSetInNamespace('kbq', url);

            const icon = firstValueFrom(registry.getNamedSvgIcon('check_16', 'kbq'));

            http.expectOne('/sprite.svg').flush(SPRITE_SVG);

            expect(await icon).toBeInstanceOf(SVGElement);
        });
    });

    describe('findSvgIcon', () => {
        it('is null on an empty registry', () => {
            expect(registry.findSvgIcon('check')).toBeNull();
        });

        it('finds only the names registered', () => {
            registry.addSvgIconLiteral('check', sanitizer.bypassSecurityTrustHtml(ICON_SVG));
            registry.addSvgIconLiteralInNamespace('brand', 'logo', sanitizer.bypassSecurityTrustHtml(ICON_SVG));

            expect(registry.findSvgIcon('check')).not.toBeNull();
            expect(registry.findSvgIcon('brand:logo')).not.toBeNull();
            expect(registry.findSvgIcon('logo', 'brand')).not.toBeNull();
            expect(registry.findSvgIcon('close')).toBeNull();
            expect(registry.findSvgIcon('logo')).toBeNull();
        });

        it('leaves any name of a namespace with an icon set to the set', () => {
            registry.addSvgIconSetInNamespace('sprite', sanitizer.bypassSecurityTrustResourceUrl('/sprite.svg'));

            expect(registry.findSvgIcon('sprite:anything')).not.toBeNull();
            expect(registry.findSvgIcon('anything', 'sprite')).not.toBeNull();
            expect(registry.findSvgIcon('anything')).toBeNull();
        });
    });

    describe('getNamedSvgIcon errors', () => {
        it('errors when no icon registered', async () => {
            await expect(firstValueFrom(registry.getNamedSvgIcon('missing'))).rejects.toThrow('missing');
        });
    });

    describe('XSS prevention for raw SVG literals', () => {
        /**
         * Cast plain strings as SafeHtml to exercise the sanitizer.sanitize(SecurityContext.HTML, ...)
         * path inside addSvgIconLiteralInNamespace. Angular sanitizes plain strings but returns
         * trusted SafeHtml values as-is, so this cast simulates a caller bypassing the type system
         * (e.g. a dynamic value that loses its type at runtime).
         */
        const unsafe = (html: string) => html as unknown as SafeHtml;

        // Angular's sanitizer reports in dev mode whenever it strips content, which is what these tests provoke.
        let warn: MockInstance;

        const SANITIZER_WARNING = expect.stringContaining('sanitizing HTML stripped some content');

        beforeEach(() => {
            warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        });

        it('throws when input sanitizes to empty (script-only literal)', () => {
            expect(() => registry.addSvgIconLiteral('evil', unsafe('<script>alert(1)</script>'))).toThrow(
                /sanitized to empty string/
            );
            expect(warn).toHaveBeenCalledWith(SANITIZER_WARNING);
        });

        it('strips <script> elements embedded in the SVG', () => {
            expect(() => {
                registry.addSvgIconLiteral(
                    'check',
                    unsafe(
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
                            '<script>window.__xss = true</script>' +
                            '<path d="M0 0h16v16H0z"/>' +
                            '</svg>'
                    )
                );
            }).toThrow();
            expect(warn).toHaveBeenCalledWith(SANITIZER_WARNING);
        });

        it('strips inline event-handler attributes from the SVG root', () => {
            expect(() => {
                registry.addSvgIconLiteral(
                    'check',
                    unsafe(
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" onload="window.__xss=true">' +
                            '<path d="M0 0h16v16H0z"/>' +
                            '</svg>'
                    )
                );
            }).toThrow();
            expect(warn).toHaveBeenCalledWith(SANITIZER_WARNING);
        });

        it('strips event-handler attributes from nested SVG children', () => {
            expect(() => {
                registry.addSvgIconLiteral(
                    'check',
                    unsafe(
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
                            '<path d="M0 0h16v16H0z" onclick="window.__xss=true"/>' +
                            '</svg>'
                    )
                );
            }).toThrow();
            expect(warn).toHaveBeenCalledWith(SANITIZER_WARNING);
        });
    });

    // A synchronous throw escapes `getNamedSvgIcon` at the call site, where no `catchError` can reach it
    // and a subscriber's `error` callback never runs. Every failure of this class is an error
    // notification instead, which is what lets `KbqIcon` fall back to the font class. `HttpClient` is
    // provided in root, so only an explicit `null` takes it away.
    describe('without an HttpClient', () => {
        it('reports a URL-backed icon through an error notification', async () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ providers: [{ provide: HttpClient, useValue: null }] });

            const bare = TestBed.inject(KbqIconRegistry);

            bare.addSvgIcon('remote_16', TestBed.inject(DomSanitizer).bypassSecurityTrustResourceUrl('/remote.svg'));

            let icon: Promise<SVGElement> | undefined;

            expect(() => (icon = firstValueFrom(bare.getNamedSvgIcon('remote_16')))).not.toThrow();
            await expect(icon).rejects.toThrow('HttpClient is required');
        });
    });
});

describe('KbqIconRegistry configured through providers', () => {
    it('finds only the names a resolver answers for', () => {
        TestBed.configureTestingModule({ providers: [kbqIconsDictProvider({ check: '/check.svg' })] });

        const registry = TestBed.inject(KbqIconRegistry);

        expect(registry.findSvgIcon('check')).not.toBeNull();
        expect(registry.findSvgIcon('close')).toBeNull();
    });

    it('leaves any bare name to a sprite configured without a namespace', () => {
        TestBed.configureTestingModule({ providers: [kbqIconsProvider({ spriteUrl: '/sprite.svg' })] });

        expect(TestBed.inject(KbqIconRegistry).findSvgIcon('anything')).not.toBeNull();
    });
});
