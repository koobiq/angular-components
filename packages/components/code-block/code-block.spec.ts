import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqTabNavBar } from '@koobiq/components/tabs';
import { HLJSApi } from 'highlight.js';
import { Observable, Subject } from 'rxjs';
import {
    KBQ_CODE_BLOCK_FALLBACK_FILE_NAME,
    KbqCodeBlock,
    kbqCodeBlockDefaultOptionsProvider,
    kbqCodeBlockLocaleConfigurationProvider
} from './code-block';
import {
    KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE,
    KbqCodeBlockHighlight,
    kbqCodeBlockHighlightJsConfigProvider
} from './code-block-highlight';
import { KbqCodeBlockModule } from './code-block.module';
import { KbqCodeBlockFile } from './types';

const HOVER_DEBOUNCE_TIME = 100;

class MockSharedResizeObserver {
    private readonly subject = new Subject<ResizeObserverEntry[]>();

    observe(_element: Element): Observable<ResizeObserverEntry[]> {
        return this.subject.asObservable();
    }

    triggerResize(): void {
        this.subject.next([]);
    }
}

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component, NoopAnimationsModule], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

// By.directive would find the tab nav bar's viewport first; the code content is the one these want.
const getScrollbarViewport = (fixture: ComponentFixture<unknown>): KbqScrollbarViewport =>
    fixture.debugElement.query(By.css('.kbq-code-block__main')).injector.get(KbqScrollbarViewport);

const geCodeBlockDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqCodeBlock));
};

const geCodeBlockHighlightDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqCodeBlockHighlight));
};

const getTabNavBarDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqTabNavBar));
};

const getTabLinkElements = (debugElement: DebugElement): HTMLAnchorElement[] => {
    return debugElement.nativeElement.querySelectorAll('.kbq-tab-link');
};

const getToggleSoftWrapButtonElement = (debugElement: DebugElement): HTMLButtonElement => {
    return debugElement.nativeElement.querySelector('.kbq-code-block__actionbar__soft-wrap-button');
};

const getDownloadButtonElement = (debugElement: DebugElement): HTMLButtonElement => {
    return debugElement.nativeElement.querySelector('.kbq-code-block__actionbar__download-button');
};

const getCopyButtonElement = (debugElement: DebugElement): HTMLButtonElement => {
    return debugElement.nativeElement.querySelector('.kbq-code-block__actionbar__copy-button');
};

const getLinkButtonElement = (debugElement: DebugElement): HTMLButtonElement => {
    return debugElement.nativeElement.querySelector('.kbq-code-block__actionbar__link-button');
};

const getViewAllButtonElement = (debugElement: DebugElement): HTMLButtonElement => {
    return debugElement.nativeElement.querySelector('.kbq-code-block__view-all__button');
};

const getCodeElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.nativeElement.querySelector('.kbq-code-block__code');
};

const mockPreHeight = (debugElement: DebugElement, height: number): void => {
    const pre: HTMLElement = debugElement.nativeElement.querySelector('.kbq-code-block__pre');

    Object.defineProperty(pre, 'offsetHeight', { get: () => height, configurable: true });
};

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class PlainCodeBlock {
    files: KbqCodeBlockFile[] = [{ language: 'html', filename: 'index.html', content: '<div>koobiq</div>' }];
}

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block softWrap canDownload [files]="files" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class ValuelessAttributesCodeBlock {
    files: KbqCodeBlockFile[] = [{ content: 'koobiq', filename: 'index.html' }];
}

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [codeFiles]="codeFiles" [canLoad]="true" [files]="files" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class DeprecatedAliasesCodeBlock {
    codeFiles: KbqCodeBlockFile[] = [{ content: 'from codeFiles', filename: 'deprecated.html' }];
    files: KbqCodeBlockFile[] = [];
}

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files" (hideTabsChange)="emissions.push($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class HideTabsCodeBlock {
    files: KbqCodeBlockFile[] = [{ content: 'one' }];
    readonly emissions: boolean[] = [];
}

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files" [(activeFileIndex)]="index" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class TwoWayCodeBlock {
    files: KbqCodeBlockFile[] = [
        { language: 'html', filename: 'a.html', content: '<div>a</div>' },
        { language: 'html', filename: 'b.html', content: '<div>b</div>' },
        { language: 'html', filename: 'c.html', content: '<div>c</div>' }
    ];
    index = 2;
}

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block
            [files]="files"
            [filled]="filled"
            [lineNumbers]="lineNumbers"
            [canToggleSoftWrap]="canToggleSoftWrap"
            [canDownload]="canDownload"
            [noBorder]="noBorder"
            [hideTabs]="hideTabs"
            [alwaysShowActionbar]="alwaysShowActionbar"
            [canCopy]="canCopy"
            [maxHeight]="maxHeight"
            [(activeFileIndex)]="activeFileIndex"
            [(softWrap)]="softWrap"
        />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class BaseCodeBlock {
    files: KbqCodeBlockFile[] = [
        {
            language: 'html',
            filename: 'index.html',
            content: `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Koobiq</title>\n\t\t<meta charset="UTF-8" />\n\t\t<base href="/">\n\t</head>\n\t<body>\n\t\t<app-root>Loading...</app-root>\n\t</body>\n</html>`
        },
        {
            language: 'typescript',
            filename: 'main.ts',
            content: `import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\n\n@Component({\n\tstandalone: true,\n\timports: [],\n\tselector: 'app-root',\n\ttemplate: \`<a target="_blank" href="https://koobiq.io/">Koobiq</a>\`,\n\tchangeDetection: ChangeDetectionStrategy.OnPush\n})\nexport class App {}\n\nbootstrapApplication(App).catch((error) => console.error(error));`
        },
        {
            language: 'css',
            filename: 'main.css',
            content: `body {\n\tfont-family: Inter, Arial, sans-serif;\n\tmargin: 0;\n}\n\na {\n\tcolor: var(--kbq-link-text);\n}`
        }
    ];
    lineNumbers: boolean = false;
    filled: boolean = false;
    canToggleSoftWrap: boolean = false;
    canDownload: boolean = false;
    canCopy: boolean = false;
    activeFileIndex: number = 0;
    noBorder: boolean = false;
    hideTabs: boolean = false;
    alwaysShowActionbar: boolean = false;
    softWrap: boolean = false;
    maxHeight: number | undefined = undefined;
}

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block hideTabs [files]="files" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class CodeBlockWithDefaultOptions {
    readonly files: KbqCodeBlockFile[] = [{ language: 'typescript', filename: 'main.ts', content: 'const value = 1;' }];
}

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files">
            <ng-template kbqCodeBlockTabLinkContent>
                {{ customFileName }}
            </ng-template>
        </kbq-code-block>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestCodeBlockWithTemplateTabLink {
    customFileName = 'TEST';

    files: KbqCodeBlockFile[] = [
        {
            language: 'html',
            filename: 'index.html',
            content: `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Koobiq</title>\n\t\t<meta charset="UTF-8" />\n\t\t<base href="/">\n\t</head>\n\t<body>\n\t\t<app-root>Loading...</app-root>\n\t</body>\n</html>`
        }
    ];
}

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files" [maxHeight]="maxHeight" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class MaxHeightCodeBlock {
    maxHeight = 200;
    files: KbqCodeBlockFile[] = [
        {
            language: 'html',
            filename: 'index.html',
            content: `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Koobiq</title>\n\t</head>\n\t<body>\n\t\t<app-root>Loading...</app-root>\n\t</body>\n</html>`
        }
    ];
}

describe(KbqCodeBlock.name, () => {
    it('should hide lineNumbers', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.lineNumbers = false;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_hide-line-numbers']).toBeTruthy();
    });

    it('should display lineNumbers', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.classes['kbq-code-block_hide-line-numbers']).toBeTruthy();
        componentInstance.lineNumbers = true;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_hide-line-numbers']).toBeFalsy();
    });

    // The async tests in this file are plain `async` rather than `waitForAsync`: the code content is a
    // `KbqScrollbarViewport`, whose track polls on a self-rescheduling `requestAnimationFrame`. That
    // chain is a macrotask of the test zone — `runOutsideAngular` leaves NgZone, not the zone
    // `waitForAsync` waits on — so it never drains and every such test times out. `fixture.whenStable()`
    // still settles, because it tracks NgZone, and that is what these tests actually need.
    it('should apply lineNumbers plugin', async () => {
        const fixture = createComponent(BaseCodeBlock);
        const codeBlock = geCodeBlockDebugElement(fixture.debugElement);

        await fixture.whenStable();

        expect(codeBlock.nativeElement.querySelector('.hljs-ln')).toBeInstanceOf(HTMLTableElement);
    });

    it('should fill the code block', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.classes['kbq-code-block_filled']).toBeFalsy();
        componentInstance.filled = true;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_filled']).toBeTruthy();
    });

    it('should outline the code block', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.filled = false;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_outline']).toBeTruthy();
    });

    it('should hide the code block border', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.classes['kbq-code-block_no-border']).toBeFalsy();
        componentInstance.noBorder = true;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_no-border']).toBeTruthy();
    });

    it('should hide the code block border when filled', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.classes['kbq-code-block_no-border']).toBeFalsy();
        componentInstance.filled = true;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_no-border']).toBeTruthy();
    });

    it('should hide tabs', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.classes['kbq-code-block_hide-tabs']).toBeFalsy();
        expect(getTabNavBarDebugElement(debugElement)).toBeTruthy();
        componentInstance.hideTabs = true;
        fixture.detectChanges();
        expect(getTabNavBarDebugElement(debugElement)).toBeFalsy();
        expect(codeBlock.classes['kbq-code-block_hide-tabs']).toBeTruthy();
    });

    it('should hide tabs for single file without filename', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.classes['kbq-code-block_hide-tabs']).toBeFalsy();
        expect(getTabNavBarDebugElement(debugElement)).toBeTruthy();
        componentInstance.files = [{ content: 'koobiq' }];
        fixture.detectChanges();
        expect(getTabNavBarDebugElement(debugElement)).toBeFalsy();
        expect(codeBlock.classes['kbq-code-block_hide-tabs']).toBeTruthy();
    });

    it('should keep tabs hidden for a single file without filename whatever hideTabs is bound to', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.files = [{ content: '<div>koobiq</div>', language: 'html' }];
        componentInstance.hideTabs = false;
        fixture.detectChanges();

        // The rule is derived, so it no longer depends on whether `[files]` or `[hideTabs]` is written
        // first - the order the two attributes happen to sit in the consumer's template used to decide it.
        expect(getTabNavBarDebugElement(debugElement)).toBeFalsy();
        expect(codeBlock.classes['kbq-code-block_hide-tabs']).toBeTruthy();
    });

    it('should bring the tabs back once the files are named', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        componentInstance.files = [{ content: '<div>koobiq</div>', language: 'html' }];
        fixture.detectChanges();

        expect(getTabNavBarDebugElement(debugElement)).toBeFalsy();

        // Writing the rule into `hideTabs` latched it: naming the files never brought the bar back, and
        // every file past the first stayed unreachable.
        componentInstance.files = [
            { content: '<div>a</div>', filename: 'a.html' },
            { content: '<div>b</div>', filename: 'b.html' }
        ];
        fixture.detectChanges();

        expect(getTabNavBarDebugElement(debugElement)).toBeTruthy();
    });

    it('should not re-emit hideTabsChange on every files assignment', () => {
        const fixture = createComponent(HideTabsCodeBlock);
        const { componentInstance } = fixture;

        fixture.detectChanges();

        componentInstance.files = [{ content: 'one' }];
        fixture.detectChanges();

        componentInstance.files = [{ content: 'two' }];
        fixture.detectChanges();

        expect(componentInstance.emissions).toEqual([]);
    });

    it('should set activeFileIndex', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const tabLinks = getTabLinkElements(debugElement);

        expect(tabLinks[1].classList.contains('kbq-selected')).toBeFalsy();
        componentInstance.activeFileIndex = 1;
        fixture.detectChanges();
        expect(tabLinks[1].classList.contains('kbq-selected')).toBeTruthy();
    });

    it('should set fallback file name if not provided', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        componentInstance.files = [{ content: 'koobiq' }, { filename: 'koobiq', content: 'koobiq' }];
        fixture.detectChanges();
        const tabLinks = getTabLinkElements(debugElement);

        expect(tabLinks[0].textContent?.trim()).toBe(TestBed.inject(KBQ_CODE_BLOCK_FALLBACK_FILE_NAME));
        expect(tabLinks[1].textContent?.trim()).toBe('koobiq');
    });

    it('should enable softWrap', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.classes['kbq-code-block_soft-wrap']).toBeFalsy();
        componentInstance.softWrap = true;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_soft-wrap']).toBeTruthy();
    });

    it('should set fallback file content language if not provided', async () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        await fixture.whenStable();

        componentInstance.files = [{ content: 'koobiq' }];
        fixture.detectChanges();

        expect(geCodeBlockHighlightDebugElement(debugElement).attributes['data-language']).toBe(
            TestBed.inject(KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE)
        );
    });

    it('should set fallback file content language if is invalid', async () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        await fixture.whenStable();

        componentInstance.files = [{ content: 'koobiq', language: 'invalid_file_language' }];
        fixture.detectChanges();

        expect(geCodeBlockHighlightDebugElement(debugElement).attributes['data-language']).toBe(
            TestBed.inject(KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE)
        );
    });

    it('should provide custom locale configuration', () => {
        const { debugElement } = createComponent(BaseCodeBlock, [
            kbqCodeBlockLocaleConfigurationProvider({
                softWrapOnTooltip: '*unit_test* Enable word wrap',
                softWrapOffTooltip: '*unit_test* Disable word wrap',
                downloadTooltip: '*unit_test* Download',
                copiedTooltip: '*unit_test* ✓ Copied',
                copyTooltip: '*unit_test* Copy',
                viewAllText: '*unit_test* Show all',
                viewLessText: '*unit_test* Show less',
                openExternalSystemTooltip: '*unit_test* Open in the external system'
            })
        ]);

        expect(geCodeBlockDebugElement(debugElement).componentInstance.localeConfiguration).toMatchSnapshot();
    });

    it('should highlight code', async () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const code = geCodeBlockHighlightDebugElement(debugElement);

        await fixture.whenStable();

        componentInstance.activeFileIndex = 0;
        fixture.detectChanges();
        expect(code.classes['hljs']).toBe(true);
        expect(code.attributes['data-language']).toBe('html');
        componentInstance.activeFileIndex = 1;
        fixture.detectChanges();
        expect(code.classes['hljs']).toBe(true);
        expect(code.attributes['data-language']).toBe('typescript');
        componentInstance.activeFileIndex = 2;
        fixture.detectChanges();
        expect(code.classes['hljs']).toBe(true);
        expect(code.attributes['data-language']).toBe('css');
    });

    it('should display toggle soft wrap button', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        expect(getToggleSoftWrapButtonElement(debugElement)).toBeFalsy();
        componentInstance.canToggleSoftWrap = true;
        fixture.detectChanges();
        expect(getToggleSoftWrapButtonElement(debugElement)).toBeTruthy();
    });

    it('should toggle softWrap property by click', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const toggleSoftWrapSpy = jest.spyOn(geCodeBlockDebugElement(debugElement).componentInstance, 'toggleSoftWrap');

        componentInstance.canToggleSoftWrap = true;
        fixture.detectChanges();
        getToggleSoftWrapButtonElement(debugElement).click();
        getToggleSoftWrapButtonElement(debugElement).click();
        expect(toggleSoftWrapSpy).toHaveBeenCalledTimes(2);
    });

    it('should display copy button', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        expect(getCopyButtonElement(debugElement)).toBeFalsy();
        componentInstance.canCopy = true;
        fixture.detectChanges();
        expect(getCopyButtonElement(debugElement)).toBeTruthy();
    });

    it('should copy code content by click', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const copyCodeSpy = jest.spyOn(geCodeBlockDebugElement(debugElement).componentInstance, 'copyCode');

        componentInstance.canCopy = true;
        fixture.detectChanges();
        getCopyButtonElement(debugElement).click();
        expect(copyCodeSpy).toHaveBeenCalledTimes(1);
    });

    it('should display download button', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        expect(getDownloadButtonElement(debugElement)).toBeFalsy();
        componentInstance.canDownload = true;
        fixture.detectChanges();
        expect(getDownloadButtonElement(debugElement)).toBeTruthy();
    });

    it('should download code content by click', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const downloadCodeSpy = jest.spyOn(geCodeBlockDebugElement(debugElement).componentInstance, 'downloadCode');

        componentInstance.canDownload = true;
        fixture.detectChanges();
        getDownloadButtonElement(debugElement).click();
        expect(downloadCodeSpy).toHaveBeenCalledTimes(1);
    });

    it('should display link button', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        expect(getLinkButtonElement(debugElement)).toBeFalsy();
        componentInstance.files = [{ content: 'koobiq', link: 'https://koobiq.io' }];
        fixture.detectChanges();
        expect(getLinkButtonElement(debugElement)).toBeTruthy();
    });

    it('should open link by click', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const openLinkSpy = jest.spyOn(geCodeBlockDebugElement(debugElement).componentInstance, 'openLink');

        componentInstance.files = [{ content: 'koobiq', link: 'https://koobiq.io' }];
        fixture.detectChanges();
        getLinkButtonElement(debugElement).click();
        expect(openLinkSpy).toHaveBeenCalledTimes(1);
    });

    it('should show actionbar on mobile devices', () => {
        const { debugElement } = createComponent(BaseCodeBlock, [
            {
                provide: Platform,
                useValue: {
                    IOS: true,
                    ANDROID: true
                } satisfies Partial<Platform>
            }
        ]);
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
    });

    it('should show actionbar when tabs are visible', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.hideTabs = false;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
    });

    it('should show actionbar on hover when tabs are hidden', fakeAsync(() => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.hideTabs = true;
        fixture.detectChanges();
        codeBlock.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
        tick(HOVER_DEBOUNCE_TIME);
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
        codeBlock.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
        tick(HOVER_DEBOUNCE_TIME);
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeFalsy();
    }));

    it('should always show actionbar when alwaysShowActionbar is enabled', fakeAsync(() => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.hideTabs = true;
        componentInstance.alwaysShowActionbar = true;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();

        codeBlock.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
        tick(HOVER_DEBOUNCE_TIME);
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
    }));

    it('should use alwaysShowActionbar from default options', () => {
        const { debugElement } = createComponent(CodeBlockWithDefaultOptions, [
            kbqCodeBlockDefaultOptionsProvider({ alwaysShowActionbar: true })
        ]);
        const codeBlock = geCodeBlockDebugElement(debugElement);

        expect(codeBlock.componentInstance.alwaysShowActionbar()).toBeTruthy();
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
    });

    it('should override alwaysShowActionbar from default options with input', () => {
        const fixture = createComponent(BaseCodeBlock, [
            kbqCodeBlockDefaultOptionsProvider({ alwaysShowActionbar: true })
        ]);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.hideTabs = true;
        fixture.detectChanges();

        expect(codeBlock.componentInstance.alwaysShowActionbar()).toBeFalsy();
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeFalsy();
    });

    it('should not track hover when alwaysShowActionbar is enabled', () => {
        const addEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener');

        try {
            TestBed.configureTestingModule({ imports: [BaseCodeBlock, NoopAnimationsModule] });
            const fixture = TestBed.createComponent(BaseCodeBlock);

            fixture.componentInstance.hideTabs = true;
            fixture.componentInstance.alwaysShowActionbar = true;
            fixture.detectChanges();

            const codeBlockElement = geCodeBlockDebugElement(fixture.debugElement).nativeElement;
            const hostHoverListeners = addEventListenerSpy.mock.calls.filter(
                ([eventName], index) =>
                    addEventListenerSpy.mock.contexts[index] === codeBlockElement &&
                    (eventName === 'mouseenter' || eventName === 'mouseleave')
            );

            expect(hostHoverListeners).toHaveLength(0);
        } finally {
            addEventListenerSpy.mockRestore();
        }
    });

    it('should start tracking hover when alwaysShowActionbar is disabled', fakeAsync(() => {
        TestBed.configureTestingModule({ imports: [BaseCodeBlock, NoopAnimationsModule] });
        const fixture = TestBed.createComponent(BaseCodeBlock);

        fixture.componentInstance.hideTabs = true;
        fixture.componentInstance.alwaysShowActionbar = true;
        fixture.detectChanges();

        fixture.componentInstance.alwaysShowActionbar = false;
        fixture.detectChanges();

        const codeBlock = geCodeBlockDebugElement(fixture.debugElement);

        codeBlock.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
        tick(HOVER_DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
    }));

    it('should restore hover behavior when alwaysShowActionbar is disabled', fakeAsync(() => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.hideTabs = true;
        componentInstance.alwaysShowActionbar = true;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();

        componentInstance.alwaysShowActionbar = false;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeFalsy();

        codeBlock.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
        tick(HOVER_DEBOUNCE_TIME);
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
    }));

    it('should stop tracking hover when hideTabs changes to false', fakeAsync(() => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement);

        componentInstance.hideTabs = true;
        fixture.detectChanges();

        codeBlock.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
        tick(HOVER_DEBOUNCE_TIME);
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeFalsy();

        componentInstance.hideTabs = false;
        fixture.detectChanges();
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();

        codeBlock.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
        tick(HOVER_DEBOUNCE_TIME);
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
    }));

    it('should show viewAll button when content overflows maxHeight', () => {
        const mockResizeObserver = new MockSharedResizeObserver();
        const fixture = createComponent(MaxHeightCodeBlock, [
            { provide: SharedResizeObserver, useValue: mockResizeObserver }
        ]);
        const { debugElement } = fixture;

        expect(getViewAllButtonElement(debugElement)).toBeNull();

        mockPreHeight(debugElement, 500);
        mockResizeObserver.triggerResize();
        fixture.detectChanges();

        expect(getViewAllButtonElement(debugElement)).toBeInstanceOf(HTMLButtonElement);
    });

    it('should toggle viewAll property by click', () => {
        const mockResizeObserver = new MockSharedResizeObserver();
        const fixture = createComponent(MaxHeightCodeBlock, [
            { provide: SharedResizeObserver, useValue: mockResizeObserver }
        ]);
        const { debugElement } = fixture;
        const spy = jest.spyOn(geCodeBlockDebugElement(debugElement).componentInstance, 'toggleViewAll');

        mockPreHeight(debugElement, 500);
        mockResizeObserver.triggerResize();
        fixture.detectChanges();

        getViewAllButtonElement(debugElement).click();

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should toggle viewAll property by ENTER keydown', () => {
        const mockResizeObserver = new MockSharedResizeObserver();
        const fixture = createComponent(MaxHeightCodeBlock, [
            { provide: SharedResizeObserver, useValue: mockResizeObserver }
        ]);
        const { debugElement } = fixture;
        const spy = jest.spyOn(geCodeBlockDebugElement(debugElement).componentInstance, 'toggleViewAll');

        mockPreHeight(debugElement, 500);
        mockResizeObserver.triggerResize();
        fixture.detectChanges();

        getViewAllButtonElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(spy).toHaveBeenCalledTimes(1);
    });

    describe('viewAll button visibility', () => {
        it('should not show viewAll button when content fits within maxHeight', () => {
            const fixture = createComponent(MaxHeightCodeBlock, [
                { provide: SharedResizeObserver, useValue: new MockSharedResizeObserver() }
            ]);

            // jsdom returns offsetHeight = 0 by default, which is less than maxHeight = 200
            expect(getViewAllButtonElement(fixture.debugElement)).toBeNull();
        });

        it('should show viewAll button when content overflows maxHeight', () => {
            const mockResizeObserver = new MockSharedResizeObserver();
            const fixture = createComponent(MaxHeightCodeBlock, [
                { provide: SharedResizeObserver, useValue: mockResizeObserver }
            ]);
            const { debugElement } = fixture;

            mockPreHeight(debugElement, 500);
            mockResizeObserver.triggerResize();
            fixture.detectChanges();

            expect(getViewAllButtonElement(debugElement)).toBeInstanceOf(HTMLButtonElement);
        });

        it('should hide viewAll button when content shrinks below maxHeight', () => {
            const mockResizeObserver = new MockSharedResizeObserver();
            const fixture = createComponent(MaxHeightCodeBlock, [
                { provide: SharedResizeObserver, useValue: mockResizeObserver }
            ]);
            const { debugElement } = fixture;

            mockPreHeight(debugElement, 500);
            mockResizeObserver.triggerResize();
            fixture.detectChanges();
            expect(getViewAllButtonElement(debugElement)).toBeInstanceOf(HTMLButtonElement);

            mockPreHeight(debugElement, 100);
            mockResizeObserver.triggerResize();
            fixture.detectChanges();
            expect(getViewAllButtonElement(debugElement)).toBeNull();
        });
    });

    it('should use template for tabLink when provided', () => {
        const fixture = createComponent(TestCodeBlockWithTemplateTabLink);
        const { debugElement, componentInstance } = fixture;
        const textContent = getTabLinkElements(debugElement)[0].textContent?.trim();

        expect(componentInstance.files[0].filename).toBeTruthy();
        expect(textContent).not.toBe(componentInstance.files[0].filename);
        expect(textContent).toBe(componentInstance.customFileName);
    });

    describe('with core (async highlight.js loading)', () => {
        const buildMockCore = () =>
            ({
                getLanguage: jest.fn().mockReturnValue({}),
                highlight: jest.fn().mockImplementation((_content: string, { language }: { language: string }) => ({
                    value: `<span class="hljs-keyword">code</span>`,
                    language,
                    illegal: false,
                    relevance: 10
                })),
                registerLanguage: jest.fn()
            }) as unknown as HLJSApi;

        it('should defer highlighting until hljs core is loaded', async () => {
            const mockCore = buildMockCore();
            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () => Promise.resolve({ default: mockCore })
                })
            ]);
            const code = geCodeBlockHighlightDebugElement(fixture.debugElement);

            expect(code.attributes['data-language']).toBeUndefined();

            await fixture.whenStable();

            expect(code.attributes['data-language']).toBe('html');
            expect(mockCore.highlight).toHaveBeenCalled();
        });

        it('should clear pending when the hljs core fails to load', async () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

            try {
                const fixture = createComponent(BaseCodeBlock, [
                    kbqCodeBlockHighlightJsConfigProvider({
                        core: async () => {
                            throw new Error('offline');
                        }
                    })
                ]);
                const highlight = fixture.debugElement
                    .query(By.directive(KbqCodeBlockHighlight))
                    .injector.get(KbqCodeBlockHighlight);

                await fixture.whenStable();

                // Only `highlight()` used to clear it, and that never runs when the load fails: everything
                // waiting on `pending` - `scrollTo`, the overflow gate - stalled for the rest of the page.
                expect(highlight.pending()).toBe(false);
                expect(warn).toHaveBeenCalled();
            } finally {
                warn.mockRestore();
            }
        });

        it('should call registerLanguage for each provided language', async () => {
            const mockCore = buildMockCore();
            const typescriptLoader = jest.fn().mockResolvedValue({ default: jest.fn() });
            const cssLoader = jest.fn().mockResolvedValue({ default: jest.fn() });

            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () => Promise.resolve({ default: mockCore as any }),
                    languages: {
                        typescript: typescriptLoader,
                        css: cssLoader
                    }
                })
            ]);

            await fixture.whenStable();

            expect(typescriptLoader).toHaveBeenCalledTimes(1);
            expect(cssLoader).toHaveBeenCalledTimes(1);
            expect(mockCore.registerLanguage).toHaveBeenCalledTimes(2);
        });

        it('should apply the pending file after hljs loads', async () => {
            const mockCore = buildMockCore();
            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () => Promise.resolve({ default: mockCore })
                })
            ]);
            const code = geCodeBlockHighlightDebugElement(fixture.debugElement);

            expect(mockCore.highlight).not.toHaveBeenCalled();

            await fixture.whenStable();

            expect(mockCore.highlight).toHaveBeenCalled();
            expect(code.attributes['data-language']).toBeDefined();
        });

        it('should fall back to fallback language for unknown languages (async path)', async () => {
            const mockCore = buildMockCore();

            (mockCore.getLanguage as jest.Mock).mockReturnValue(undefined);
            (mockCore.highlight as jest.Mock).mockImplementation(
                (_content: string, { language: _lang }: { language: string }) => ({
                    value: `<span>code</span>`,
                    language: 'plaintext',
                    illegal: false,
                    relevance: 0
                })
            );

            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () => Promise.resolve({ default: mockCore })
                })
            ]);

            await fixture.whenStable();

            expect(geCodeBlockHighlightDebugElement(fixture.debugElement).attributes['data-language']).toBe(
                TestBed.inject(KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE)
            );
        });

        it('should set pending to true while hljs is loading', () => {
            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () =>
                        new Promise<{ default: HLJSApi }>(() => {
                            /* never resolves within this synchronous test */
                        })
                })
            ]);
            const highlight = geCodeBlockHighlightDebugElement(fixture.debugElement).injector.get(
                KbqCodeBlockHighlight
            );

            expect(highlight.pending()).toBe(true);
        });

        it('should set pending to false after hljs has loaded', async () => {
            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () => Promise.resolve({ default: buildMockCore() })
                })
            ]);
            const highlight = geCodeBlockHighlightDebugElement(fixture.debugElement).injector.get(
                KbqCodeBlockHighlight
            );

            await fixture.whenStable();

            expect(highlight.pending()).toBe(false);
        });
    });

    describe('scrollTo', () => {
        const createMockCore = () =>
            ({
                getLanguage: jest.fn().mockReturnValue({}),
                highlight: jest.fn().mockImplementation((_content: string, { language }: { language: string }) => ({
                    value: `<span class="hljs-keyword">code</span>`,
                    language,
                    illegal: false,
                    relevance: 10
                })),
                registerLanguage: jest.fn()
            }) as unknown as HLJSApi;

        it('should scroll immediately when highlighting is complete', async () => {
            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () => Promise.resolve({ default: createMockCore() })
                })
            ]);

            await fixture.whenStable();

            const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;
            const scrollSpy = jest.spyOn(getScrollbarViewport(fixture), 'scrollTo').mockImplementation(() => {});

            codeBlock.scrollTo({ top: 50 });

            expect(scrollSpy).toHaveBeenCalledWith({ top: 50 });
        });

        it('should defer scroll until highlighting completes when pending', async () => {
            let resolveCore!: (value: { default: HLJSApi }) => void;

            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () =>
                        new Promise<{ default: HLJSApi }>((resolve) => {
                            resolveCore = resolve;
                        })
                })
            ]);

            const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;
            const scrollSpy = jest.spyOn(getScrollbarViewport(fixture), 'scrollTo').mockImplementation(() => {});

            codeBlock.scrollTo({ top: 100 });
            expect(scrollSpy).not.toHaveBeenCalled();

            resolveCore({ default: createMockCore() });
            await fixture.whenStable();

            expect(scrollSpy).toHaveBeenCalledWith({ top: 100 });
        });

        it('reveals the scrollbar once highlighting settles, so an arriving block advertises its scroll', async () => {
            let resolveCore!: (value: { default: HLJSApi }) => void;
            // Installed on the prototype, before the component exists: a spy taken off the instance
            // afterwards could not have recorded a premature flash, which is half of what this asserts.
            const flashSpy = jest.spyOn(KbqScrollbarViewport.prototype, 'flashScrollIndicators');

            const fixture = createComponent(BaseCodeBlock, [
                kbqCodeBlockHighlightJsConfigProvider({
                    core: () =>
                        new Promise<{ default: HLJSApi }>((resolve) => {
                            resolveCore = resolve;
                        })
                })
            ]);

            expect(flashSpy).not.toHaveBeenCalled();

            resolveCore({ default: createMockCore() });
            await fixture.whenStable();

            expect(flashSpy).toHaveBeenCalled();
        });
    });
    it('should report undefined for a maxHeight bound to undefined', () => {
        const fixture = createComponent(BaseCodeBlock);
        const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;

        fixture.detectChanges();

        // The binding runs the transform over `undefined`, which `numberAttribute` alone turns into NaN.
        expect(codeBlock.maxHeight()).toBeUndefined();
    });

    it('should report undefined for a maxHeight that is never bound', () => {
        const fixture = createComponent(PlainCodeBlock);
        const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;

        fixture.detectChanges();

        expect(codeBlock.maxHeight()).toBeUndefined();
    });

    it('should report undefined for a maxHeight that is not a number', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;

        componentInstance.maxHeight = '200px' as never;
        fixture.detectChanges();

        expect(codeBlock.maxHeight()).toBeUndefined();
    });

    it('should drop the calculated max height once viewAll is on', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;

        componentInstance.maxHeight = 200;
        fixture.detectChanges();

        const main = fixture.nativeElement.querySelector('.kbq-code-block__main') as HTMLElement;

        expect(codeBlock.maxHeight()).toBe(200);
        expect(main.style.maxHeight).toBe('200px');

        codeBlock.toggleViewAll();
        fixture.detectChanges();

        expect(main.style.maxHeight).toBe('');
    });

    it('should expose the highlighted file on the highlight directive', () => {
        const fixture = createComponent(BaseCodeBlock);

        fixture.detectChanges();

        const highlight = fixture.debugElement
            .query(By.directive(KbqCodeBlockHighlight))
            .injector.get(KbqCodeBlockHighlight);

        expect(highlight.file().filename).toBe('index.html');

        fixture.componentInstance.activeFileIndex = 1;
        fixture.detectChanges();

        expect(highlight.file().filename).toBe('main.ts');
    });
    it('should arm the overflow gate for a maxHeight that arrives after init', () => {
        const mockResizeObserver = new MockSharedResizeObserver();
        const fixture = createComponent(BaseCodeBlock, [
            { provide: SharedResizeObserver, useValue: mockResizeObserver }
        ]);
        const { componentInstance, debugElement } = fixture;

        fixture.detectChanges();
        mockPreHeight(debugElement, 500);

        expect(getViewAllButtonElement(debugElement)).toBeNull();

        // The gate used to be armed once, from `ngAfterViewInit`, so a limit bound later clipped the
        // content with no way to expand it and no way in from the keyboard.
        componentInstance.maxHeight = 200;
        fixture.detectChanges();

        expect(getViewAllButtonElement(debugElement)).toBeInstanceOf(HTMLButtonElement);

        componentInstance.maxHeight = 1000;
        fixture.detectChanges();

        expect(getViewAllButtonElement(debugElement)).toBeNull();
    });

    it('should render the first file when the active index falls outside the file list', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;

        componentInstance.activeFileIndex = 2;
        fixture.detectChanges();

        expect(codeBlock.activeFileIndex()).toBe(2);

        componentInstance.files = componentInstance.files.slice(0, 2);
        fixture.detectChanges();

        // The render falls back rather than writing the index back: resetting it from inside the `files`
        // setter clobbered whatever the parent had put into `[(activeFileIndex)]` in the same tick.
        expect(codeBlock.activeFileIndex()).toBe(2);
        expect(getCodeElement(fixture.debugElement).textContent).toContain(componentInstance.files[0].content);
    });

    it('should not write the active index back while the parent is updating', () => {
        const fixture = createComponent(TwoWayCodeBlock);
        const { componentInstance } = fixture;

        fixture.detectChanges();

        expect(componentInstance.index).toBe(2);

        componentInstance.files = componentInstance.files.slice(0, 2);
        componentInstance.index = 1;
        fixture.detectChanges();

        expect(componentInstance.index).toBe(1);
        expect(getCodeElement(fixture.debugElement).textContent).toContain(componentInstance.files[1].content);
    });

    it('should treat a valueless boolean attribute as true', () => {
        const fixture = createComponent(ValuelessAttributesCodeBlock);
        const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;

        fixture.detectChanges();

        // The whole point of the backing input: `booleanAttribute` turns the empty string a valueless
        // attribute passes into `true`, which a `model()` could not do.
        expect(codeBlock.softWrap()).toBe(true);
        expect(codeBlock.canDownload()).toBe(true);
    });

    it('should turn the download button on through the deprecated canLoad attribute', () => {
        const fixture = createComponent(DeprecatedAliasesCodeBlock);
        const { debugElement } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement).componentInstance as KbqCodeBlock;

        fixture.detectChanges();

        expect(codeBlock.canDownload()).toBe(true);
        expect(getDownloadButtonElement(debugElement)).toBeInstanceOf(HTMLButtonElement);
    });

    it('should fall back to the deprecated codeFiles input while files is empty', () => {
        const fixture = createComponent(DeprecatedAliasesCodeBlock);
        const { componentInstance, debugElement } = fixture;
        const codeBlock = geCodeBlockDebugElement(debugElement).componentInstance as KbqCodeBlock;

        fixture.detectChanges();

        expect(codeBlock.files()).toEqual(componentInstance.codeFiles);
        expect(getCodeElement(debugElement).textContent).toContain(componentInstance.codeFiles[0].content);

        // `files` used to be written by the `codeFiles` setter, so whichever came last in the template won.
        componentInstance.files = [{ content: 'from files', filename: 'files.html' }];
        fixture.detectChanges();

        expect(codeBlock.files()).toEqual(componentInstance.files);
    });

    it('should render nothing rather than crash on an empty file list', () => {
        const fixture = createComponent(PlainCodeBlock);

        fixture.componentInstance.files = [];

        expect(() => fixture.detectChanges()).not.toThrow();
        expect(fixture.nativeElement.querySelector('.kbq-code-block__pre')).toBeNull();
    });

    it('should fall back to the first file for an active index that is not a number', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { componentInstance } = fixture;
        const codeBlock = geCodeBlockDebugElement(fixture.debugElement).componentInstance as KbqCodeBlock;

        // `numberAttribute` turns an unset `index?: number` into NaN, which walked past every range guard.
        componentInstance.activeFileIndex = undefined as never;

        expect(() => fixture.detectChanges()).not.toThrow();
        expect(codeBlock.activeFileIndex()).toBe(0);
    });
});
