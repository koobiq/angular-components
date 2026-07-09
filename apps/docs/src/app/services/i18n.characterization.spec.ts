import { Clipboard } from '@angular/cdk/clipboard';
import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KbqToastService } from '@koobiq/components/toast';
import { BehaviorSubject, map } from 'rxjs';
import { DocsCopyButtonComponent } from '../components/copy-button/copy-button';
import { DocsPageNotFoundComponent } from '../components/page-not-found/page-not-found.component';
import { DocsLocale } from '../constants/locale';
import { DocsClipboardService } from './clipboard';
import { DocsLocaleService } from './locale';

/**
 * Characterization tests locking the exact bilingual UI strings rendered today, so the migration
 * to a central translation dictionary (DOCS-I18N-01) can be proven behavior-preserving. The
 * assertions are intentionally agnostic to HOW the string is produced (ternary vs `t()`).
 *
 * Scope is limited to components whose module graph does not reach `@koobiq/docs-examples`, which
 * the shared Jest config cannot yet resolve (see memory: docs Jest / docs-examples path gap).
 */

const provideDocsLocale = (locale: DocsLocale) => {
    const changes = new BehaviorSubject<DocsLocale>(locale);

    return {
        provide: DocsLocaleService,
        useValue: {
            get locale() {
                return changes.value;
            },
            changes: changes.asObservable(),
            isRuLocale: changes.pipe(map((value) => value === DocsLocale.Ru)),
            isSupportedLocale: (value: string) => value === DocsLocale.Ru || value === DocsLocale.En
        }
    };
};

const render = <T>(component: Type<T>, locale: DocsLocale): ComponentFixture<T> => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        imports: [component],
        providers: [provideDocsLocale(locale), provideRouter([])]
    });

    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

describe('docs i18n strings (characterization)', () => {
    describe(DocsPageNotFoundComponent.name, () => {
        it('renders Russian strings', () => {
            const text = render(DocsPageNotFoundComponent, DocsLocale.Ru).nativeElement.textContent;

            expect(text).toContain('Страница не найдена');
            expect(text).toContain('Перейти на главную страницу');
        });

        it('renders English strings', () => {
            const text = render(DocsPageNotFoundComponent, DocsLocale.En).nativeElement.textContent;

            expect(text).toContain('Page not found');
            expect(text).toContain('Go to main page');
        });
    });

    describe(DocsCopyButtonComponent.name, () => {
        const ariaLabel = (locale: DocsLocale): string | null | undefined =>
            render(DocsCopyButtonComponent, locale)
                .nativeElement.querySelector('[role="button"]')
                ?.getAttribute('aria-label');

        it('labels the copy control per locale', () => {
            expect(ariaLabel(DocsLocale.Ru)).toBe('Скопировать');
            expect(ariaLabel(DocsLocale.En)).toBe('Copy');
        });
    });

    describe(`${DocsClipboardService.name} success toast`, () => {
        const showToastTitle = (locale: DocsLocale): string => {
            const show = jest.fn();

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    DocsClipboardService,
                    provideDocsLocale(locale),
                    { provide: Clipboard, useValue: { copy: () => true } },
                    { provide: KbqToastService, useValue: { show } }
                ]
            });

            TestBed.inject(DocsClipboardService).copyWithToast('anything');

            return show.mock.calls[0][0].title;
        };

        it('shows the localized "Copied" toast', () => {
            expect(showToastTitle(DocsLocale.Ru)).toBe('Скопировано');
            expect(showToastTitle(DocsLocale.En)).toBe('Copied');
        });
    });
});
