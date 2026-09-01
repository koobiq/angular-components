import { setKoobiqThemeBodyClass } from './html-config';

describe('setKoobiqThemeBodyClass', () => {
    it('adds the theme classes to a body with no class attribute', () => {
        const result = setKoobiqThemeBodyClass('<html><body></body></html>', 'light');

        expect(result.changed).toBe(true);
        expect(result.content).toContain('<body class="kbq-app-background kbq-light">');
    });

    it('handles a single-quoted class attribute, unlike a double-quote-only regex would', () => {
        const result = setKoobiqThemeBodyClass("<html><body class='app'></body></html>", 'light');

        expect(result.content).toContain('class="app kbq-app-background kbq-light"');
        // The tag must stay well-formed — no duplicate `class` attribute left behind for the
        // browser to silently drop one of.
        expect(result.content.match(/class=/g)).toHaveLength(1);
    });

    it("doesn't corrupt an unrelated attribute whose name merely ends in 'class'", () => {
        const result = setKoobiqThemeBodyClass('<html><body data-class="x" id="r"></body></html>', 'dark');

        expect(result.content).toContain('data-class="x"');
        expect(result.content).toContain('class="kbq-app-background kbq-dark"');
    });

    it("doesn't mistake a '<body' mentioned inside a comment for the real element", () => {
        const html = '<html><!-- put after <body> tag --><body class="real"></body></html>';
        const result = setKoobiqThemeBodyClass(html, 'light');

        expect(result.content).toContain('<!-- put after <body> tag -->');
        expect(result.content).toContain('class="real kbq-app-background kbq-light"');
    });

    it("doesn't expand '$'-sequences from the existing markup as replacement patterns", () => {
        const result = setKoobiqThemeBodyClass('<html><body data-q="a$&b"></body></html>', 'light');

        expect(result.content).toContain('data-q="a$&b"');
        expect(result.content).not.toContain('<body data-q="a<body');
    });

    it('replaces a previously-applied theme instead of accumulating classes on re-run', () => {
        const first = setKoobiqThemeBodyClass('<html><body class="app"></body></html>', 'light');
        const second = setKoobiqThemeBodyClass(first.content, 'dark');

        expect(second.content).toContain('class="app kbq-app-background kbq-dark"');
        expect(second.content).not.toContain('kbq-light');
    });

    it('only applies kbq-app-background for the auto theme, leaving light/dark to KbqThemeService', () => {
        const result = setKoobiqThemeBodyClass('<html><body></body></html>', 'auto');

        expect(result.content).toContain('class="kbq-app-background"');
    });

    it('is a no-op when run again with the same theme', () => {
        const first = setKoobiqThemeBodyClass('<html><body></body></html>', 'light');
        const second = setKoobiqThemeBodyClass(first.content, 'light');

        expect(second.changed).toBe(false);
        expect(second.content).toBe(first.content);
    });

    it('returns unchanged when there is no <body> element', () => {
        const result = setKoobiqThemeBodyClass('<html></html>', 'light');

        expect(result.changed).toBe(false);
    });
});
