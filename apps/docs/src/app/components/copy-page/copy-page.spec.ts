import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from 'jest-axe';
import { BehaviorSubject, map } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsClipboardService } from '../../services/clipboard';
import { DocsLocaleService } from '../../services/locale';
import { DocsStructureCategoryId, DocsStructureItemId } from '../../structure';
import { DocsCopyPage } from './copy-page';

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

describe(DocsCopyPage.name, () => {
    let fixture: ComponentFixture<DocsCopyPage>;
    let http: HttpTestingController;
    let clipboard: { copyWithToast: jest.Mock; copyLaterWithToast: jest.Mock };

    const buttons = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('button'));

    const setUp = (locale: DocsLocale): void => {
        clipboard = { copyWithToast: jest.fn().mockReturnValue(true), copyLaterWithToast: jest.fn() };

        TestBed.configureTestingModule({
            imports: [DocsCopyPage],
            providers: [
                provideDocsLocale(locale),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: DocsClipboardService, useValue: clipboard }
            ]
        });

        fixture = TestBed.createComponent(DocsCopyPage);
        fixture.componentRef.setInput('item', {
            categoryId: DocsStructureCategoryId.Components,
            id: DocsStructureItemId.Button
        });
        fixture.detectChanges();
        http = TestBed.inject(HttpTestingController);
    };

    afterEach(() => http.verify());

    describe('in English', () => {
        beforeEach(() => setUp(DocsLocale.En));

        it('has no axe violations', async () => {
            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('names the group and the menu of its actions', () => {
            const [copy, menu] = buttons();

            expect(fixture.nativeElement.querySelector('kbq-split-button').getAttribute('aria-label')).toBe(
                'Page as Markdown'
            );
            expect(copy.textContent?.trim()).toBe('Copy page');
            expect(menu.getAttribute('aria-label')).toBe('More page actions');
        });

        it('copies at once the Markdown it loaded while the pointer was on the button', async () => {
            const [copy] = buttons();

            copy.dispatchEvent(new Event('pointerenter'));
            http.expectOne('/en/components/button.md').flush('# Button');
            await fixture.whenStable();

            copy.click();

            expect(clipboard.copyWithToast).toHaveBeenCalledWith('# Button');
            expect(clipboard.copyLaterWithToast).not.toHaveBeenCalled();
        });

        it('copies the loaded Markdown the other way when the browser refuses the quick copy', async () => {
            const [copy] = buttons();

            clipboard.copyWithToast.mockReturnValue(false);
            copy.dispatchEvent(new Event('pointerenter'));
            http.expectOne('/en/components/button.md').flush('# Button');
            await fixture.whenStable();

            copy.click();

            expect(clipboard.copyLaterWithToast).toHaveBeenCalledWith(expect.any(Promise), 'copyPageFailed');
            await expect(clipboard.copyLaterWithToast.mock.calls[0][0]).resolves.toBe('# Button');
        });

        it('copies the Markdown as it loads when the click comes first', async () => {
            buttons()[0].click();

            expect(clipboard.copyLaterWithToast).toHaveBeenCalledWith(expect.any(Promise), 'copyPageFailed');

            http.expectOne('/en/components/button.md').flush('# Button');

            await expect(clipboard.copyLaterWithToast.mock.calls[0][0]).resolves.toBe('# Button');
        });

        it('loads the Markdown again after a failed attempt', async () => {
            const [copy] = buttons();

            copy.dispatchEvent(new Event('focus'));
            http.expectOne('/en/components/button.md').flush('', { status: 404, statusText: 'Not Found' });
            await fixture.whenStable();

            copy.dispatchEvent(new Event('focus'));
            http.expectOne('/en/components/button.md').flush('# Button');
            await fixture.whenStable();

            copy.click();

            expect(clipboard.copyWithToast).toHaveBeenCalledWith('# Button');
        });

        it('opens the Markdown and the assistants of each vendor from its menu, pointing them at the Markdown', () => {
            buttons()[1].click();
            fixture.detectChanges();

            const links = Array.from(
                TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll<HTMLAnchorElement>('a')
            );
            const prompt = (link: HTMLAnchorElement): string =>
                decodeURIComponent(link.getAttribute('href')!.split(/[?&](?:q|prompt|text)=/)[1]);

            expect(links.map((link) => link.getAttribute('href')!.split('?')[0])).toEqual([
                '/en/components/button.md',
                'https://claude.ai/new',
                'claude://code/new',
                'claude-cli://open',
                'https://chatgpt.com/',
                'codex://new',
                'cursor://anysphere.cursor-deeplink/prompt'
            ]);
            expect(links.map((link) => link.textContent?.trim())).toEqual([
                'View as Markdown',
                'Open in Claude',
                'Open in Claude Code',
                'Open in Claude Code in the terminal',
                'Open in ChatGPT',
                'Open in Codex',
                'Open in Cursor'
            ]);

            const [, claude, claudeCode, claudeCodeTerminal, chatGpt, codex, cursor] = links;

            for (const chat of [claude, chatGpt]) {
                expect(prompt(chat)).toContain("I'm reading the Koobiq Angular documentation");
                expect(prompt(chat)).toContain('http://localhost/en/components/button.md');
            }

            for (const agent of [claudeCode, claudeCodeTerminal, codex, cursor]) {
                expect(prompt(agent)).toContain('help me use it in this project');
                expect(prompt(agent)).toContain('http://localhost/llms.txt');
            }
        });
    });

    it('copies the English Markdown from a page in Russian, and asks the assistants in Russian', () => {
        setUp(DocsLocale.Ru);

        buttons()[0].click();
        http.expectOne('/en/components/button.md').flush('# Button');

        buttons()[1].click();
        fixture.detectChanges();

        const claude = TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll('a')[1];

        expect(buttons()[0].textContent?.trim()).toBe('Скопировать страницу');
        expect(decodeURIComponent(claude.href.split('?q=')[1])).toContain(
            'Я читаю документацию Koobiq Angular: http://localhost/en/components/button.md'
        );
    });
});
