import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject, map } from 'rxjs';
import type { Mock } from 'vitest';
import { KbqCodeBlock, kbqCodeBlockHighlightJsConfigProvider } from '@koobiq/components/code-block';
import { KbqStateSavingService } from '@koobiq/components/core';
import { EXAMPLE_COMPONENTS, type LiveExample } from '@koobiq/docs-examples';
import { DOCS_HIGHLIGHT_JS_LANGUAGES } from '../../constants/highlight-js';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsLiveExampleViewerComponent } from './docs-live-example-viewer';

const EXAMPLE_ID = 'basic-select-example';
const EXAMPLE_SOURCE_PATH = 'docs-content/examples-source/select';

/** Stands in for the example class a page compiled from MDX passes to the viewer. */
@Component({
    selector: 'docs-basic-select-example',
    template: 'Basic select'
})
class BasicSelectExample {}

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

describe(DocsLiveExampleViewerComponent.name, () => {
    let fixture: ComponentFixture<DocsLiveExampleViewerComponent>;
    let httpMock: HttpTestingController;
    let requestFullscreen: Mock<() => Promise<void>>;
    let exitFullscreen: Mock<() => Promise<void>>;

    const fullscreenEnabledDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenEnabled');
    const fullscreenElementDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenElement');
    const exitFullscreenDescriptor = Object.getOwnPropertyDescriptor(document, 'exitFullscreen');
    const requestFullscreenDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'requestFullscreen');

    const toggle = (): HTMLElement => fixture.nativeElement.querySelector('.docs-live-example__footer [kbqLink]');
    const fullscreenButton = (): HTMLButtonElement =>
        fixture.nativeElement.querySelector('[aria-label="Enter full screen"]');
    const setFullscreenElement = (element: Element | null): void => {
        Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
    };

    // Separate from `beforeEach` so a spec can re-create the component after changing the Fullscreen
    // API stubs: the capability is resolved once, by the root service, on the first render.
    const createFixture = async (url = '/en/components/select/overview'): Promise<void> => {
        TestBed.configureTestingModule({
            imports: [DocsLiveExampleViewerComponent],
            providers: [
                provideDocsLocale(DocsLocale.En),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([{ path: '**', children: [] }]),
                kbqCodeBlockHighlightJsConfigProvider({ languages: DOCS_HIGHLIGHT_JS_LANGUAGES })
            ]
        });

        await TestBed.inject(Router).navigateByUrl(url);

        fixture = TestBed.createComponent(DocsLiveExampleViewerComponent);
        httpMock = TestBed.inject(HttpTestingController);
        fixture.componentRef.setInput('example', EXAMPLE_ID);
        fixture.componentRef.setInput('component', BasicSelectExample);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };

    beforeEach(async () => {
        EXAMPLE_COMPONENTS[EXAMPLE_ID] = {
            componentName: 'BasicSelectExample',
            selector: 'basic-select-example',
            packagePath: 'select',
            files: ['basic-select-example.ts', 'basic-select-example.html']
        } as LiveExample;

        requestFullscreen = vi.fn().mockResolvedValue(undefined);
        exitFullscreen = vi.fn().mockResolvedValue(undefined);

        Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
        setFullscreenElement(null);
        Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exitFullscreen });
        Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
            configurable: true,
            value: requestFullscreen
        });

        await createFixture();
    });

    // `verify()` throws on an outstanding request, so the restore has to be unconditional: leaving
    // `document` and `HTMLElement.prototype` patched would break every spec that runs after.
    afterEach(() => {
        try {
            httpMock.verify();
        } finally {
            Reflect.deleteProperty(EXAMPLE_COMPONENTS, EXAMPLE_ID);

            for (const [target, property, descriptor] of [
                [document, 'fullscreenEnabled', fullscreenEnabledDescriptor],
                [document, 'fullscreenElement', fullscreenElementDescriptor],
                [document, 'exitFullscreen', exitFullscreenDescriptor],
                [HTMLElement.prototype, 'requestFullscreen', requestFullscreenDescriptor]
            ] as const) {
                if (descriptor) {
                    Object.defineProperty(target, property, descriptor);
                } else {
                    Reflect.deleteProperty(target, property);
                }
            }
        }
    });

    it('has no axe violations', async () => {
        await expect(fixture.nativeElement).toHaveNoViolations();
    });

    // The toggle used to be announced as a link with no state and no Space activation (A11Y-02).
    it('announces the source-view toggle as a button with its expanded state', () => {
        expect(toggle().getAttribute('role')).toBe('button');
        expect(toggle().getAttribute('tabindex')).toBe('0');
        expect(toggle().getAttribute('aria-expanded')).toBe('false');
    });

    // A plain link rather than a router link, so the browser opens the tab even before hydration.
    it('links to the page of the example, opened in a new tab', () => {
        const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[aria-label="Open in new tab"]');

        expect(link.getAttribute('href')).toBe(`/examples/${EXAMPLE_ID}`);
        expect(link.target).toBe('_blank');
        expect(link.rel).toBe('nofollow');
    });

    it.each([
        ['click', () => new MouseEvent('click', { bubbles: true })],
        ['Enter', () => new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })],
        ['Space', () => new KeyboardEvent('keydown', { key: ' ', bubbles: true })]
    ])('toggles the source view on %s', (_name, createEvent) => {
        toggle().dispatchEvent(createEvent());
        fixture.detectChanges();

        expect(toggle().getAttribute('aria-expanded')).toBe('true');
        expect(toggle().textContent?.trim()).toBe('Hide code');

        // Showing the source fetches it: answer, so that no request is left open.
        httpMock.match(() => true).forEach((request) => request.flush(''));
    });

    // The viewer element itself has to go fullscreen: `:fullscreen` styles key off
    // `.docs-live-example-viewer`, so requesting it for any other element renders an unstyled overlay.
    it('enters fullscreen mode for the whole viewer', async () => {
        fullscreenButton().click();
        await fixture.whenStable();

        expect(requestFullscreen).toHaveBeenCalledTimes(1);
        expect(requestFullscreen.mock.contexts[0]).toBe(fixture.nativeElement);
    });

    it('updates the fullscreen action when the browser enters or exits fullscreen mode', () => {
        setFullscreenElement(fixture.nativeElement);
        document.dispatchEvent(new Event('fullscreenchange'));
        fixture.detectChanges();

        expect(fullscreenButton()).toBeNull();
        expect(fixture.nativeElement.querySelector('[aria-label="Exit full screen"]')).not.toBeNull();

        setFullscreenElement(null);
        document.dispatchEvent(new Event('fullscreenchange'));
        fixture.detectChanges();

        expect(fullscreenButton()).not.toBeNull();
        expect(fixture.nativeElement.querySelector('[aria-label="Exit full screen"]')).toBeNull();
    });

    // Without the capability guard the action would render on platforms with no element Fullscreen
    // API (iOS Safari supports it for video only), where the click rejects into an empty `catch`.
    it('does not render the fullscreen action when the Fullscreen API is unavailable', async () => {
        TestBed.resetTestingModule();
        Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false });

        await createFixture();

        expect(fullscreenButton()).toBeNull();
        expect(fixture.nativeElement.querySelector('[aria-label="Exit full screen"]')).toBeNull();
    });

    it('exits fullscreen mode from the action button', async () => {
        setFullscreenElement(fixture.nativeElement);
        document.dispatchEvent(new Event('fullscreenchange'));
        fixture.detectChanges();

        fixture.nativeElement.querySelector('[aria-label="Exit full screen"]').click();
        await fixture.whenStable();

        expect(exitFullscreen).toHaveBeenCalledTimes(1);
    });

    describe('with a registered example', () => {
        const flushSource = (): void => {
            httpMock.expectOne(`${EXAMPLE_SOURCE_PATH}/basic-select-example.ts`).flush('export class X {}');
            httpMock.expectOne(`${EXAMPLE_SOURCE_PATH}/basic-select-example.html`).flush('<p>\n\tOne\n</p>');
            fixture.detectChanges();
        };

        const showSource = (): void => {
            toggle().click();
            fixture.detectChanges();
            flushSource();
        };

        const renderedExample = (): HTMLElement | null =>
            fixture.nativeElement.querySelector('.docs-live-example__example docs-basic-select-example');

        // Fetched on the server, the sources would be serialized into the prerendered page.
        it('loads the example source only when it is shown', () => {
            expect(fixture.componentInstance.exampleData()).toBeDefined();
            httpMock.expectNone(`${EXAMPLE_SOURCE_PATH}/basic-select-example.ts`);

            showSource();

            expect(fixture.componentInstance.files()).toHaveLength(2);
            expect(fixture.nativeElement.querySelector('kbq-code-block')).not.toBeNull();
        });

        it('renders the example class the page passes', () => {
            expect(renderedExample()?.textContent).toBe('Basic select');
        });

        // The server runs no render hooks, so an example given as a loader is left out of the prerendered page.
        it('holds the place of an example given as a loader with a skeleton until it has loaded', async () => {
            const viewer = TestBed.createComponent(DocsLiveExampleViewerComponent);
            const example = (): HTMLElement => viewer.nativeElement.querySelector('.docs-live-example__example');
            const load = vi.fn(() => Promise.resolve(BasicSelectExample));

            viewer.componentRef.setInput('example', EXAMPLE_ID);
            viewer.componentRef.setInput('component', { load });
            viewer.detectChanges();

            expect(example().querySelector('kbq-skeleton')).not.toBeNull();
            expect(example().querySelector('docs-basic-select-example')).toBeNull();
            expect(example().getAttribute('aria-busy')).toBe('true');

            await viewer.whenStable();
            viewer.detectChanges();

            expect(load).toHaveBeenCalledTimes(1);
            expect(example().querySelector('kbq-skeleton')).toBeNull();
            expect(example().querySelector('docs-basic-select-example')?.textContent).toBe('Basic select');
            expect(example().hasAttribute('aria-busy')).toBe(false);
        });

        // The example used to be torn down and loaded again asynchronously; a class that is already known
        // has to come back as a new instance in the same pass.
        it('re-creates the example on reset', () => {
            const before = renderedExample();

            (fixture.componentInstance as unknown as { reload(): void }).reload();
            fixture.detectChanges();

            expect(renderedExample()).not.toBeNull();
            expect(renderedExample()).not.toBe(before);
        });

        // Showing the source again used to append to `files` and duplicate every source tab.
        it('reloads the same example without duplicating its source tabs', () => {
            showSource();

            (fixture.componentInstance as unknown as { reload(): void }).reload();
            toggle().click();
            toggle().click();
            fixture.detectChanges();

            expect(fixture.componentInstance.files()).toHaveLength(2);
            expect(fixture.componentInstance.exampleData()).toBeDefined();
        });

        describe('link to lines of the source', () => {
            const scrollIntoView = vi.fn();
            const markedLines = (): string[] =>
                Array.from<HTMLElement>(
                    fixture.nativeElement.querySelectorAll('kbq-code-block .kbq-code-block__line_marked')
                ).map(({ textContent }) => textContent?.trim() ?? '');

            // jsdom does not implement scrolling into view.
            beforeEach(() => (Element.prototype.scrollIntoView = scrollIntoView));
            afterEach(() => Reflect.deleteProperty(Element.prototype, 'scrollIntoView'));

            it('opens the source at the lines of the file the address names and scrolls to them', async () => {
                TestBed.resetTestingModule();
                await createFixture(`/en/components/select/overview?example=${EXAMPLE_ID}&file=html&lines=2-3`);
                flushSource();
                await fixture.whenStable();

                expect(toggle().getAttribute('aria-expanded')).toBe('true');
                expect(markedLines()).toEqual(['One', '</p>']);
                expect(scrollIntoView).toHaveBeenCalledTimes(1);
                expect(scrollIntoView.mock.contexts[0]).toHaveProperty('textContent', '\tOne\n');
            });

            it('marks nothing for an address that names another example', async () => {
                TestBed.resetTestingModule();
                await createFixture('/en/components/select/overview?example=other-example&file=html&lines=2');

                expect(toggle().getAttribute('aria-expanded')).toBe('false');
                httpMock.expectNone(`${EXAMPLE_SOURCE_PATH}/basic-select-example.ts`);
            });

            it('puts the lines the reader selects into the address, and takes them out with the source', async () => {
                const router = TestBed.inject(Router);

                showSource();

                const codeBlock: KbqCodeBlock = fixture.debugElement.query(
                    By.directive(KbqCodeBlock)
                ).componentInstance;

                codeBlock.filesChange.emit(
                    codeBlock.files().map((file, index) => (index === 0 ? { ...file, markedLines: [[2, 3]] } : file))
                );
                await fixture.whenStable();

                expect(router.url).toBe(`/en/components/select/overview?example=${EXAMPLE_ID}&file=html&lines=2-3`);
                expect(markedLines()).toEqual(['One', '</p>']);
                // The reader is at the lines already.
                expect(scrollIntoView).not.toHaveBeenCalled();

                toggle().click();
                await fixture.whenStable();

                expect(router.url).toBe('/en/components/select/overview');
            });

            const selectLines = async (fileIndex: number, markedLines: [number, number][]): Promise<void> => {
                const codeBlock: KbqCodeBlock = fixture.debugElement.query(
                    By.directive(KbqCodeBlock)
                ).componentInstance;

                codeBlock.filesChange.emit(
                    codeBlock.files().map((file, index) => (index === fileIndex ? { ...file, markedLines } : file))
                );
                await fixture.whenStable();
            };

            it('keeps the reader on the file they unmark the lines of', async () => {
                showSource();

                const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.kbq-tab-link'));

                tabs[1]?.click();
                await selectLines(1, [[1, 1]]);
                await selectLines(1, []);

                expect(TestBed.inject(Router).url).toBe('/en/components/select/overview');
                expect(fixture.nativeElement.querySelector('kbq-code-block code')?.textContent).toBe(
                    'export class X {}'
                );
            });

            it('scrolls to none of the lines the reader selects after a link to lines the source lacks', async () => {
                // The code block warns that the line it is given is past the end of the file.
                const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

                try {
                    TestBed.resetTestingModule();
                    await createFixture(`/en/components/select/overview?example=${EXAMPLE_ID}&file=html&lines=99`);
                    flushSource();
                    await fixture.whenStable();

                    await selectLines(0, [[2, 2]]);

                    expect(markedLines()).toEqual(['One']);
                    expect(scrollIntoView).not.toHaveBeenCalled();
                } finally {
                    warn.mockRestore();
                }
            });
        });

        it('clears what the components inside the example persisted, and leaves the rest alone', () => {
            const exampleElement: HTMLElement = fixture.nativeElement.querySelector('.docs-live-example__example');
            const insideHost = document.createElement('div');
            const outsideHost = document.createElement('div');

            exampleElement.appendChild(insideHost);
            document.body.appendChild(outsideHost);

            const inside = { name: 'inside', key: 'a', enabled: true, state: null, host: insideHost, clear: vi.fn() };
            // The documentation site persists state of its own, and so do the other examples on the page.
            const outside = {
                name: 'outside',
                key: 'b',
                enabled: true,
                state: null,
                host: outsideHost,
                clear: vi.fn()
            };

            vi.spyOn(TestBed.inject(KbqStateSavingService), 'components').mockReturnValue([inside, outside]);

            try {
                (fixture.componentInstance as unknown as { reload(): void }).reload();
                fixture.detectChanges();

                expect(inside.clear).toHaveBeenCalled();
                expect(outside.clear).not.toHaveBeenCalled();
            } finally {
                outsideHost.remove();
            }
        });
    });
});
