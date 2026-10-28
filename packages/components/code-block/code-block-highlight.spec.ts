import { ApplicationRef, ChangeDetectionStrategy, Component, PLATFORM_ID, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HLJSApi } from 'highlight.js';
import { firstValueFrom } from 'rxjs';
import {
    kbqCodeBlockFallbackFileLanguageProvider,
    KbqCodeBlockHighlight,
    KbqCodeBlockHighlightJsConfig,
    kbqCodeBlockHighlightJsConfigProvider
} from './code-block-highlight';
import { KbqCodeBlockFile } from './types';

const buildMockCore = (): HLJSApi =>
    ({
        getLanguage: vi.fn().mockReturnValue({}),
        highlight: vi.fn().mockImplementation((content: string, { language }: { language: string }) => ({
            // Empty for empty content, as highlight.js has it.
            value: content && `<span class="hljs-keyword">${content}</span>`,
            language,
            illegal: false,
            relevance: 10
        })),
        registerLanguage: vi.fn()
    }) as unknown as HLJSApi;

const coreLoader = (core: HLJSApi) => vi.fn(() => Promise.resolve({ default: core }));

// A core load that settles only when the test says so.
const deferredCoreLoader = (core: HLJSApi) => {
    let settle!: () => void;
    const load = vi.fn(
        () => new Promise<{ default: HLJSApi }>((resolve) => (settle = () => resolve({ default: core })))
    );

    return { load, resolve: () => settle() };
};

const FILE: KbqCodeBlockFile = { content: 'one', language: 'typescript' };

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });
    const fixture = TestBed.createComponent(component);

    fixture.autoDetectChanges();

    return fixture;
};

// A block that keeps the markup rendered on the server holds no pending task, so `whenStable()` alone does not wait for
// its load: a macrotask starts once every promise of the load has settled.
const settle = async (fixture: ComponentFixture<unknown>): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
};

const getCodeElements = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
    fixture.debugElement.queryAll(By.directive(KbqCodeBlockHighlight)).map(({ nativeElement }) => nativeElement);

const getHighlight = (fixture: ComponentFixture<unknown>): KbqCodeBlockHighlight =>
    fixture.debugElement.query(By.directive(KbqCodeBlockHighlight)).injector.get(KbqCodeBlockHighlight);

const countPluginStyles = (): number =>
    Array.from(document.head.querySelectorAll('style')).filter(({ textContent }) =>
        textContent?.includes('.hljs-ln-n:before{content:attr(data-line-number)}')
    ).length;

@Component({
    imports: [KbqCodeBlockHighlight],
    template: `
        <code kbqCodeBlockHighlight [file]="file()"></code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SingleBlock {
    readonly file = signal(FILE);
}

@Component({
    imports: [KbqCodeBlockHighlight],
    template: `
        @for (file of files; track $index) {
            <code kbqCodeBlockHighlight [file]="file"></code>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ThreeBlocks {
    readonly files: KbqCodeBlockFile[] = [
        { content: 'one', language: 'typescript' },
        { content: 'two', language: 'css' },
        { content: 'three', language: 'xml' }
    ];
}

const scopedCore = buildMockCore();
const scopedConfig: KbqCodeBlockHighlightJsConfig = { core: coreLoader(scopedCore) };

@Component({
    selector: 'test-scoped-block',
    imports: [KbqCodeBlockHighlight],
    template: `
        <code kbqCodeBlockHighlight [file]="file"></code>
    `,
    providers: [kbqCodeBlockHighlightJsConfigProvider(scopedConfig)],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ScopedBlock {
    readonly file: KbqCodeBlockFile = { content: 'scoped', language: 'css' };
}

@Component({
    imports: [KbqCodeBlockHighlight, ScopedBlock],
    template: `
        <code kbqCodeBlockHighlight [file]="file"></code>
        <test-scoped-block />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class RootAndScopedBlocks {
    readonly file: KbqCodeBlockFile = { content: 'root', language: 'typescript' };
}

// Markup as the server leaves it, marked as highlighted, which is what the browser finds inside `<code>` on hydration.
@Component({
    imports: [KbqCodeBlockHighlight],
    template: `
        <code kbqCodeBlockHighlight data-highlighted-markup data-language="typescript" [file]="file()">
            <span class="server-markup">one</span>
        </code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ServerRenderedBlock {
    readonly file = signal(FILE);
}

@Component({
    imports: [KbqCodeBlockHighlight],
    template: `
        <code kbqCodeBlockHighlight [file]="file">
            <span class="foreign-markup">outdated</span>
        </code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ForeignMarkupBlock {
    readonly file = FILE;
}

const TYPESCRIPT_FILE: KbqCodeBlockFile = { content: 'const value: number = 1;', language: 'typescript' };

@Component({
    selector: 'test-typescript-scope',
    imports: [KbqCodeBlockHighlight],
    template: `
        <code kbqCodeBlockHighlight [file]="file"></code>
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: { typescript: () => import('highlight.js/lib/languages/typescript') }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TypescriptScope {
    readonly file = TYPESCRIPT_FILE;
}

// The scope loads highlight.js before the root block appears, which would find typescript on an instance they shared.
@Component({
    imports: [KbqCodeBlockHighlight, TypescriptScope],
    template: `
        <test-typescript-scope />
        @if (showRootBlock()) {
            <code kbqCodeBlockHighlight [file]="file"></code>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ScopeThenRootBlock {
    readonly showRootBlock = signal(false);
    readonly file = TYPESCRIPT_FILE;
}

describe(KbqCodeBlockHighlight.name, () => {
    it('should show the plain content until highlight.js has loaded', () => {
        const fixture = createComponent(SingleBlock, [
            kbqCodeBlockHighlightJsConfigProvider({ core: () => new Promise<{ default: HLJSApi }>(() => {}) })
        ]);
        const [code] = getCodeElements(fixture);

        expect(code.textContent).toBe('one');
        expect(code.children.length).toBe(0);
        expect(code.hasAttribute('data-highlighted-markup')).toBe(false);
        expect(getHighlight(fixture).pending()).toBe(true);
    });

    it('should load highlight.js and install the line numbers plugin once for every block on the page', async () => {
        const addEventListener = vi.spyOn(document, 'addEventListener');
        const stylesBefore = countPluginStyles();

        try {
            const core = buildMockCore();
            const load = coreLoader(core);
            const fixture = createComponent(ThreeBlocks, [kbqCodeBlockHighlightJsConfigProvider({ core: load })]);

            await settle(fixture);

            expect(load).toHaveBeenCalledTimes(1);
            expect(core.highlight).toHaveBeenCalledTimes(3);
            expect(getCodeElements(fixture).map((code) => code.getAttribute('data-language'))).toEqual([
                'typescript',
                'css',
                'xml'
            ]);
            expect(countPluginStyles() - stylesBefore).toBe(1);
            expect(addEventListener.mock.calls.filter(([type]) => type === 'copy')).toHaveLength(1);
        } finally {
            addEventListener.mockRestore();
        }
    });

    it('should load the languages alongside highlight.js', async () => {
        const core = buildMockCore();
        const { load, resolve } = deferredCoreLoader(core);
        const typescript = vi.fn(() => import('highlight.js/lib/languages/typescript'));
        const fixture = createComponent(SingleBlock, [
            kbqCodeBlockHighlightJsConfigProvider({ core: load, languages: { typescript } })
        ]);

        expect(typescript).toHaveBeenCalledTimes(1);

        resolve();
        await settle(fixture);

        expect(core.registerLanguage).toHaveBeenCalledWith('typescript', expect.any(Function));
        expect(getCodeElements(fixture)[0].getAttribute('data-language')).toBe('typescript');
    });

    it('should apply a configuration provided by a component to the blocks inside it only', async () => {
        const rootCore = buildMockCore();
        const rootLoad = coreLoader(rootCore);
        const fixture = createComponent(RootAndScopedBlocks, [
            kbqCodeBlockHighlightJsConfigProvider({ core: rootLoad })
        ]);

        await settle(fixture);

        expect(rootLoad).toHaveBeenCalledTimes(1);
        expect(scopedConfig.core).toHaveBeenCalled();
        expect(rootCore.highlight).toHaveBeenCalledTimes(1);
        expect(rootCore.highlight).toHaveBeenCalledWith('root', { language: 'typescript' });
        expect(scopedCore.highlight).toHaveBeenCalledTimes(1);
        expect(scopedCore.highlight).toHaveBeenCalledWith('scoped', { language: 'css' });
    });

    it('should keep the plain content, clear pending and try again on the next file after a failed load', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            const core = buildMockCore();
            const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ default: core });
            const fixture = createComponent(SingleBlock, [kbqCodeBlockHighlightJsConfigProvider({ core: load })]);
            const [code] = getCodeElements(fixture);

            await settle(fixture);

            expect(getHighlight(fixture).pending()).toBe(false);
            expect(code.textContent).toBe('one');
            expect(warn).toHaveBeenCalledWith('[KbqCodeBlock] Failed to load highlight.js.', expect.any(Error));

            fixture.componentInstance.file.set({ content: 'two', language: 'css' });
            await settle(fixture);

            expect(load).toHaveBeenCalledTimes(2);
            expect(code.getAttribute('data-language')).toBe('css');
        } finally {
            warn.mockRestore();
        }
    });

    it('should highlight an empty file', async () => {
        const fixture = createComponent(SingleBlock, [
            kbqCodeBlockHighlightJsConfigProvider({ core: coreLoader(buildMockCore()) })
        ]);
        const [code] = getCodeElements(fixture);

        fixture.componentInstance.file.set({ content: '', language: 'typescript' });
        await settle(fixture);

        expect(code.textContent).toBe('');
        expect(code.getAttribute('data-language')).toBe('typescript');
        expect(getHighlight(fixture).pending()).toBe(false);
    });

    it('should keep the markup rendered on the server until highlight.js has loaded, then render it again', async () => {
        const core = buildMockCore();
        const { load, resolve } = deferredCoreLoader(core);
        const fixture = createComponent(ServerRenderedBlock, [kbqCodeBlockHighlightJsConfigProvider({ core: load })]);
        const [code] = getCodeElements(fixture);

        expect(load).toHaveBeenCalledTimes(1);
        expect(code.querySelector('.server-markup')).toBeInstanceOf(HTMLSpanElement);
        expect(code.getAttribute('data-language')).toBe('typescript');
        // Taken once: a file that arrives before highlight.js is not the one the markup was rendered for.
        expect(code.hasAttribute('data-highlighted-markup')).toBe(false);
        expect(getHighlight(fixture).pending()).toBe(true);

        resolve();
        await settle(fixture);

        expect(core.highlight).toHaveBeenCalledWith('one', { language: 'typescript' });
        expect(code.querySelector('.server-markup')).toBeNull();
        expect(code.querySelector('.hljs-keyword')?.textContent).toBe('one');
        expect(code.hasAttribute('data-highlighted-markup')).toBe(true);
        expect(getHighlight(fixture).pending()).toBe(false);
    });

    it('should replace markup it has not highlighted itself with the plain content', () => {
        const { load } = deferredCoreLoader(buildMockCore());
        const fixture = createComponent(ForeignMarkupBlock, [kbqCodeBlockHighlightJsConfigProvider({ core: load })]);
        const [code] = getCodeElements(fixture);

        expect(code.querySelector('.foreign-markup')).toBeNull();
        expect(code.textContent).toBe('one');
    });

    it('should show the plain content of a file that replaces the server markup before highlight.js has loaded', async () => {
        const core = buildMockCore();
        const { load, resolve } = deferredCoreLoader(core);
        const fixture = createComponent(ServerRenderedBlock, [kbqCodeBlockHighlightJsConfigProvider({ core: load })]);
        const [code] = getCodeElements(fixture);

        fixture.componentInstance.file.set({ content: 'two', language: 'css' });
        fixture.detectChanges();

        expect(code.textContent).toBe('two');
        expect(code.hasAttribute('data-language')).toBe(false);

        resolve();
        await settle(fixture);

        expect(core.highlight).toHaveBeenCalledTimes(1);
        expect(core.highlight).toHaveBeenCalledWith('two', { language: 'css' });
        expect(code.getAttribute('data-language')).toBe('css');
    });

    it('should hold server rendering until the code is highlighted', async () => {
        const core = buildMockCore();
        const { load, resolve } = deferredCoreLoader(core);
        const fixture = createComponent(SingleBlock, [
            { provide: PLATFORM_ID, useValue: 'server' },
            kbqCodeBlockHighlightJsConfigProvider({ core: load })
        ]);

        expect(await firstValueFrom(TestBed.inject(ApplicationRef).isStable)).toBe(false);

        resolve();
        await fixture.whenStable();

        expect(core.highlight).toHaveBeenCalledWith('one', { language: 'typescript' });
    });

    // Angular replays what a reader did before hydration only once the application is stable.
    it('should leave the application stable while a block keeps the markup rendered on the server', async () => {
        const { load } = deferredCoreLoader(buildMockCore());
        const fixture = createComponent(ServerRenderedBlock, [kbqCodeBlockHighlightJsConfigProvider({ core: load })]);

        await fixture.whenStable();

        expect(await firstValueFrom(TestBed.inject(ApplicationRef).isStable)).toBe(true);
        expect(getHighlight(fixture).pending()).toBe(true);
    });

    it('should keep the markup rendered on the server when highlight.js fails to load', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            const load = vi.fn().mockRejectedValue(new Error('offline'));
            const fixture = createComponent(ServerRenderedBlock, [
                kbqCodeBlockHighlightJsConfigProvider({ core: load })
            ]);
            const [code] = getCodeElements(fixture);

            await settle(fixture);

            expect(code.querySelector('.server-markup')).toBeInstanceOf(HTMLSpanElement);
            expect(getHighlight(fixture).pending()).toBe(false);
            expect(warn).toHaveBeenCalledWith('[KbqCodeBlock] Failed to load highlight.js.', expect.any(Error));
        } finally {
            warn.mockRestore();
        }
    });

    // The mocks above know every language; the core knows none, and throws on a language it has not registered.
    describe('with the highlight.js core', () => {
        it('should load the core, without languages, when nothing is configured', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            try {
                const fixture = createComponent(SingleBlock);
                const [code] = getCodeElements(fixture);

                await settle(fixture);

                expect(warn).toHaveBeenCalledWith(
                    '[KbqCodeBlock] Unknown file language: "typescript". Fall back to "plaintext".',
                    FILE
                );
                expect(code.getAttribute('data-language')).toBe('plaintext');
                expect(code.textContent).toBe('one');
            } finally {
                warn.mockRestore();
            }
        });

        it('should highlight a file without a language as plain text', async () => {
            const fixture = createComponent(SingleBlock);
            const [code] = getCodeElements(fixture);

            fixture.componentInstance.file.set({ content: '<b>plain</b>' });
            fixture.detectChanges();
            await settle(fixture);

            expect(code.getAttribute('data-language')).toBe('plaintext');
            expect(code.textContent).toBe('<b>plain</b>');
            expect(getHighlight(fixture).pending()).toBe(false);
        });

        it.each(['plaintext', 'text', 'txt'])(
            'should not warn that plain text named "%s" does not match its language',
            async (language) => {
                const fixture = createComponent(SingleBlock);
                const [code] = getCodeElements(fixture);

                fixture.componentInstance.file.set({ content: 'plain words', language });
                fixture.detectChanges();
                await settle(fixture);

                expect(code.getAttribute('data-language')).toBe(language);
                expect(code.textContent).toBe('plain words');
            }
        );

        it('should not warn that an empty file does not match its language', async () => {
            const fixture = createComponent(SingleBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    languages: { typescript: () => import('highlight.js/lib/languages/typescript') }
                })
            ]);
            const [code] = getCodeElements(fixture);

            fixture.componentInstance.file.set({ content: '', language: 'typescript' });
            fixture.detectChanges();
            await settle(fixture);

            expect(code.getAttribute('data-language')).toBe('typescript');
        });

        it('should warn that a file does not match its language', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            try {
                const fixture = createComponent(SingleBlock, [
                    kbqCodeBlockHighlightJsConfigProvider({
                        languages: { typescript: () => import('highlight.js/lib/languages/typescript') }
                    })
                ]);
                const file: KbqCodeBlockFile = { content: 'plain words', language: 'typescript' };

                fixture.componentInstance.file.set(file);
                fixture.detectChanges();
                await settle(fixture);

                expect(warn).toHaveBeenCalledWith(
                    '[KbqCodeBlock] File content does not match the specified programming language.',
                    file
                );
            } finally {
                warn.mockRestore();
            }
        });

        it('should fall back to plain text when a highlighted block gets a language the core has not registered', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            try {
                const fixture = createComponent(SingleBlock, [
                    kbqCodeBlockHighlightJsConfigProvider({
                        languages: { typescript: () => import('highlight.js/lib/languages/typescript') }
                    })
                ]);
                const [code] = getCodeElements(fixture);

                fixture.componentInstance.file.set({ content: 'const value: number = 1;', language: 'typescript' });
                fixture.detectChanges();
                await settle(fixture);

                expect(code.getAttribute('data-language')).toBe('typescript');
                expect(warn).not.toHaveBeenCalled();

                // highlight.js has loaded by now, so this file is highlighted at once, inside change detection.
                const yamlFile: KbqCodeBlockFile = { content: 'key: value', language: 'yaml' };

                fixture.componentInstance.file.set(yamlFile);
                await settle(fixture);

                expect(warn).toHaveBeenCalledWith(
                    '[KbqCodeBlock] Unknown file language: "yaml". Fall back to "plaintext".',
                    yamlFile
                );
                expect(code.getAttribute('data-language')).toBe('plaintext');
                expect(code.textContent).toBe('key: value');
                expect(getHighlight(fixture).pending()).toBe(false);
            } finally {
                warn.mockRestore();
            }
        });

        it('should fall back to the fallback language when it is registered', async () => {
            const fixture = createComponent(SingleBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    languages: { javascript: () => import('highlight.js/lib/languages/javascript') }
                }),
                kbqCodeBlockFallbackFileLanguageProvider('javascript')
            ]);
            const [code] = getCodeElements(fixture);

            fixture.componentInstance.file.set({ content: 'const value = 1;' });
            fixture.detectChanges();
            await settle(fixture);

            expect(code.getAttribute('data-language')).toBe('javascript');
        });

        it('should fall back to plain text when the fallback language is not registered either', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            try {
                const fixture = createComponent(SingleBlock, [kbqCodeBlockFallbackFileLanguageProvider('markdown')]);
                const [code] = getCodeElements(fixture);

                fixture.componentInstance.file.set({ content: '# Title' });
                fixture.detectChanges();
                await settle(fixture);

                expect(warn).toHaveBeenCalledWith(
                    '[KbqCodeBlock] Unknown fallback language: "markdown". Fall back to "plaintext".'
                );
                expect(code.getAttribute('data-language')).toBe('plaintext');
                expect(code.textContent).toBe('# Title');
            } finally {
                warn.mockRestore();
            }
        });

        it('should not share the languages of a configuration with the default one', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            try {
                const fixture = createComponent(ScopeThenRootBlock);

                await settle(fixture);
                fixture.componentInstance.showRootBlock.set(true);
                fixture.detectChanges();
                await settle(fixture);

                const [scoped, root] = getCodeElements(fixture);

                expect(scoped.getAttribute('data-language')).toBe('typescript');
                expect(root.getAttribute('data-language')).toBe('plaintext');
                expect(warn).toHaveBeenCalledWith(
                    '[KbqCodeBlock] Unknown file language: "typescript". Fall back to "plaintext".',
                    TYPESCRIPT_FILE
                );
            } finally {
                warn.mockRestore();
            }
        });
    });
});
