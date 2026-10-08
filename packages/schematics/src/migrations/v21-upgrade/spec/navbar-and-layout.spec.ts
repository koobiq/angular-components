import { runV21Upgrade } from '../testing';

const LONG_TITLE_BINDING = '`KbqNavbarBrand.longTitle` was removed and its binding dropped';
const LONG_TITLE_ACCESS = '`KbqNavbarBrand.longTitle` was removed: the two-line title is detected automatically';
const GET_TITLE_WIDTH = '`KbqNavbarItem.getTitleWidth()` was removed';
const OUTER_ELEMENT_WIDTH = '`KbqNavbarTitle.outerElementWidth` was removed';
const RESIZE_STREAM = '`KbqEllipsisCenterDirective.resizeStream` was removed';
const DL_MIN_WIDTH_WITH_BREAKPOINT = '`minWidth` was removed from `<kbq-dl>`';
const DL_MIN_WIDTH_ACCESS = '`KbqDlComponent.minWidth` was removed';

describe('v21-upgrade: navbar and layout', () => {
    describe('KbqNavbarBrand.longTitle', () => {
        it('drops a [longTitle] binding from the brand and reports it', async () => {
            const template = [
                '<a href="#" kbq-navbar-brand [longTitle]="true">',
                '    <div kbq-navbar-title>App</div>',
                '</a>',
                ''
            ].join('\n');
            const run = await runV21Upgrade({ 'brand.html': template });

            expect(run.read('brand.html')).toBe(
                ['<a href="#" kbq-navbar-brand>', '    <div kbq-navbar-title>App</div>', '</a>', ''].join('\n')
            );
            expect(run.log).toContain(LONG_TITLE_BINDING);
        });

        it('drops a static or valueless longTitle in front of the brand selector, in an inline template', async () => {
            const source = [
                '@Component({',
                '    template: `',
                "        <div longTitle='false' kbq-navbar-brand></div>",
                '        <kbq-navbar-brand longTitle></kbq-navbar-brand>',
                '        <div\n            [longTitle]="forced"\n            kbq-navbar-brand\n        ></div>',
                '    `',
                '})',
                'export class App {}',
                ''
            ].join('\n');
            const run = await runV21Upgrade({ 'inline.ts': source });

            expect(run.read('inline.ts')).toBe(
                [
                    '@Component({',
                    '    template: `',
                    '        <div kbq-navbar-brand></div>',
                    '        <kbq-navbar-brand></kbq-navbar-brand>',
                    '        <div\n            kbq-navbar-brand\n        ></div>',
                    '    `',
                    '})',
                    'export class App {}',
                    ''
                ].join('\n')
            );
            expect(run.log).toContain(LONG_TITLE_BINDING);
        });

        it('reports a read through a reference to the brand', async () => {
            const template = [
                '<a #brand="kbqNavbarBrand" href="#" kbq-navbar-brand>',
                '    @if (brand.longTitle()) { <span>long</span> }',
                '</a>',
                ''
            ].join('\n');
            const run = await runV21Upgrade({ 'brand-ref.html': template });

            expect(run.read('brand-ref.html')).toBe(template);
            expect(run.log).toContain(LONG_TITLE_ACCESS);
        });
    });

    it('reports getTitleWidth() on a navbar item and outerElementWidth on a navbar title', async () => {
        const source = [
            "import { KbqNavbarItem, KbqNavbarTitle } from '@koobiq/components/navbar';",
            'export function widths(item: KbqNavbarItem, title: KbqNavbarTitle) {',
            '    return [item.getTitleWidth(), title.outerElementWidth];',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'navbar-widths.ts': source });

        expect(run.read('navbar-widths.ts')).toBe(source);
        expect(run.log).toContain(GET_TITLE_WIDTH);
        expect(run.log).toContain(OUTER_ELEMENT_WIDTH);
    });

    it('reports resizeStream on the ellipsis center directive', async () => {
        const source = [
            "import { KbqEllipsisCenterDirective } from '@koobiq/components/ellipsis-center';",
            'export class App {',
            '    readonly ellipsis = viewChild.required(KbqEllipsisCenterDirective);',
            '    onResize(event: Event) { this.ellipsis().resizeStream.next(event); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'ellipsis.ts': source });

        expect(run.read('ellipsis.ts')).toBe(source);
        expect(run.log).toContain(RESIZE_STREAM);
    });

    describe('KbqDlComponent.minWidth', () => {
        it('rewrites minWidth on kbq-dl to verticalBreakpoint', async () => {
            const template = [
                '<kbq-dl minWidth="700" dtMinWidth="120">',
                '    <kbq-dt>term</kbq-dt>',
                '</kbq-dl>',
                '<kbq-dl wide\n    [minWidth]="breakpoint"\n></kbq-dl>',
                ''
            ].join('\n');
            const run = await runV21Upgrade({ 'dl.html': template });

            expect(run.read('dl.html')).toBe(
                [
                    '<kbq-dl verticalBreakpoint="700" dtMinWidth="120">',
                    '    <kbq-dt>term</kbq-dt>',
                    '</kbq-dl>',
                    '<kbq-dl wide\n    [verticalBreakpoint]="breakpoint"\n></kbq-dl>',
                    ''
                ].join('\n')
            );
            expect(run.log).not.toContain(DL_MIN_WIDTH_WITH_BREAKPOINT);
        });

        it('keeps and reports minWidth on a kbq-dl that sets verticalBreakpoint too', async () => {
            const template = '<kbq-dl [minWidth]="700" verticalBreakpoint="500"></kbq-dl>\n';
            const run = await runV21Upgrade({ 'dl-both.html': template });

            expect(run.read('dl-both.html')).toBe(template);
            expect(run.log).toContain(DL_MIN_WIDTH_WITH_BREAKPOINT);
        });

        it('reports programmatic access', async () => {
            const source = [
                "import { KbqDlComponent } from '@koobiq/components/dl';",
                'export function breakpoint(fixture: ComponentFixture<KbqDlComponent>) {',
                "    fixture.componentRef.setInput('minWidth', 700);",
                '    return fixture.componentInstance.minWidth();',
                '}',
                ''
            ].join('\n');
            const run = await runV21Upgrade({ 'dl-access.ts': source });

            expect(run.read('dl-access.ts')).toBe(source);
            expect(run.log).toContain(DL_MIN_WIDTH_ACCESS);
        });
    });

    it('leaves the same names on other elements and owners alone', async () => {
        const template = [
            '<kbq-content-panel-container minWidth="300" [minWidth]="width"></kbq-content-panel-container>',
            '<kbq-dl dtMinWidth="120" [ddMinWidth]="80"></kbq-dl>',
            '<div [longTitle]="true" longTitle="x"></div>',
            '<a href="#" kbq-navbar-item [longTitle]="true"></a>',
            ''
        ].join('\n');
        const source = [
            "import { KbqNavbarBrand } from '@koobiq/components/navbar';",
            'export class App {',
            '    readonly brands: { longTitle: boolean }[] = [];',
            '    readonly resizeStream = new Subject<Event>();',
            '    get firstLongTitle() { return this.brands[0].longTitle; }',
            '    getTitleWidth(): number { return this.outerElementWidth; }',
            '    outerElementWidth = 0;',
            '    measure(el: HTMLElement) { return el.style.minWidth; }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'unrelated.html': template, 'unrelated.ts': source });

        expect(run.read('unrelated.html')).toBe(template);
        expect(run.read('unrelated.ts')).toBe(source);

        for (const message of [
            LONG_TITLE_BINDING,
            LONG_TITLE_ACCESS,
            GET_TITLE_WIDTH,
            OUTER_ELEMENT_WIDTH,
            RESIZE_STREAM,
            DL_MIN_WIDTH_WITH_BREAKPOINT,
            DL_MIN_WIDTH_ACCESS
        ]) {
            expect(run.log).not.toContain(message);
        }
    });
});
