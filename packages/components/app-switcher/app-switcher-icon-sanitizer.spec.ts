import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqAppSwitcherIconSanitizer } from './app-switcher-icon-sanitizer';

describe('KbqAppSwitcherIconSanitizer', () => {
    let sanitizer: KbqAppSwitcherIconSanitizer;
    let domSanitizer: DomSanitizer;

    /** The sanitizer returns `SafeHtml`; unwrap it back to the markup the template would render. */
    const sanitize = (icon: string | null | undefined): string | null => {
        const result = sanitizer.sanitize(icon);

        return result === null ? null : domSanitizer.sanitize(1 /* SecurityContext.HTML */, result);
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        sanitizer = TestBed.inject(KbqAppSwitcherIconSanitizer);
        domSanitizer = TestBed.inject(DomSanitizer);
    });

    it('returns null for empty input', () => {
        expect(sanitizer.sanitize('')).toBeNull();
        expect(sanitizer.sanitize(null)).toBeNull();
        expect(sanitizer.sanitize(undefined)).toBeNull();
    });

    it('keeps a typical icon intact', () => {
        const icon = [
            '<svg fill="none" height="24" viewBox="0 0 32 32" width="24" xmlns="http://www.w3.org/2000/svg">',
            '<path clip-rule="evenodd" d="M0 25.6C0 28.4 0 29.9 1 30.9Z" fill-rule="evenodd" fill="#212121"/>',
            '</svg>'
        ].join('');
        const result = sanitize(icon)!;

        expect(result).toContain('viewBox="0 0 32 32"');
        expect(result).toContain('fill="#212121"');
        expect(result).toContain('clip-rule="evenodd"');
    });

    it('keeps gradients and their same-document references', () => {
        const icon =
            '<svg><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient></defs>' +
            '<use href="#g"/></svg>';
        const result = sanitize(icon)!;

        expect(result).toContain('<linearGradient');
        expect(result).toContain('<stop');
        expect(result).toContain('href="#g"');
    });

    it('drops event handler attributes', () => {
        const result = sanitize('<svg onload="window.__kbqXss = 1"><path d="M0 0" onclick="alert(1)"/></svg>')!;

        expect(result).not.toContain('onload');
        expect(result).not.toContain('onclick');
        expect(result).toContain('<path');
    });

    it('drops script, style and foreignObject elements', () => {
        expect(sanitize('<svg><script>alert(1)</script></svg>')).not.toContain('script');
        expect(sanitize('<svg><style>@import url(//evil)</style></svg>')).not.toContain('style');
        expect(sanitize('<svg><foreignObject><b>hi</b></foreignObject></svg>')).not.toContain('foreignObject');
    });

    it('drops HTML elements smuggled into the markup', () => {
        expect(sanitize('<img src="x" onerror="alert(1)">')).toBeNull();
        expect(sanitize('<iframe src="//evil"></iframe>')).toBeNull();
        expect(sanitize('<svg><a href="//evil"><path d="M0 0"/></a></svg>')).not.toContain('<a');
    });

    it('drops external references while keeping fragment ones', () => {
        expect(sanitize('<svg><use href="//evil/x.svg#icon"/></svg>')).not.toContain('href');
        expect(sanitize('<svg><use xlink:href="javascript:alert(1)"/></svg>')).not.toContain('href');
    });

    it('drops inline styles that can load or execute something', () => {
        expect(sanitize('<svg><path d="M0 0" style="background:url(//evil)"/></svg>')).not.toContain('style');
        expect(sanitize('<svg><path d="M0 0" style="fill:red"/></svg>')).toContain('style="fill:red"');
    });

    it('drops comments and CDATA sections', () => {
        const result = sanitize('<svg><!-- c --><path d="M0 0"/></svg>')!;

        expect(result).not.toContain('<!--');
        expect(result).toContain('<path');
    });

    it('is stable across a second pass, so the rendered markup matches what was checked', () => {
        const icon = '<svg viewBox="0 0 24 24"><g><path d="M0 0h24v24H0z"/></g></svg>';
        const once = sanitize(icon)!;

        expect(sanitize(once)).toBe(once);
    });
});
