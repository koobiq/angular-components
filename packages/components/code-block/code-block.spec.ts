import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqTabNavBar } from '@koobiq/components/tabs';
import { KBQ_CODE_BLOCK_FALLBACK_FILE_NAME, KbqCodeBlock, kbqCodeBlockLocaleConfigurationProvider } from './code-block';
import { KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE, KbqCodeBlockHighlight } from './code-block-highlight';
import { KbqCodeBlockModule } from './code-block.module';
import { KbqCodeBlockFile } from './types';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component, NoopAnimationsModule], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

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
    softWrap: boolean = false;
    maxHeight: number | undefined = undefined;
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

    it('should apply lineNumbers plugin', () => {
        const { debugElement } = createComponent(BaseCodeBlock);
        const codeBlock = geCodeBlockDebugElement(debugElement);

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

    it('should set fallback file content language if not provided', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        componentInstance.files = [{ content: 'koobiq' }];
        fixture.detectChanges();
        expect(geCodeBlockHighlightDebugElement(debugElement).attributes['data-language']).toBe(
            TestBed.inject(KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE)
        );
    });

    it('should set fallback file content language if is invalid', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

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

    it('should highlight code', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const code = geCodeBlockHighlightDebugElement(debugElement);

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
        tick(100); // debounceTime
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeTruthy();
        codeBlock.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
        tick(100); // debounceTime
        expect(codeBlock.classes['kbq-code-block_show-actionbar']).toBeFalsy();
    }));

    it('should show viewAll button', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;

        expect(getViewAllButtonElement(debugElement)).toBeNull();

        componentInstance.maxHeight = 300;
        fixture.detectChanges();

        expect(getViewAllButtonElement(debugElement)).toBeInstanceOf(HTMLButtonElement);
    });

    it('should toggle viewAll property by click', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const spy = jest.spyOn(geCodeBlockDebugElement(debugElement).componentInstance, 'toggleViewAll');

        componentInstance.maxHeight = 300;
        fixture.detectChanges();

        getViewAllButtonElement(debugElement).click();

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should toggle viewAll property by ENTER keydown', () => {
        const fixture = createComponent(BaseCodeBlock);
        const { debugElement, componentInstance } = fixture;
        const spy = jest.spyOn(geCodeBlockDebugElement(debugElement).componentInstance, 'toggleViewAll');

        componentInstance.maxHeight = 300;
        fixture.detectChanges();

        getViewAllButtonElement(debugElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
