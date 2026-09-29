import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { axe } from 'jest-axe';
import { BehaviorSubject, map } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsNavbarComponent } from './navbar.component';

// The search widget ships as ES modules, which Jest does not load, and it is not what these tests are about.
jest.mock('@docsearch/js', () => ({ __esModule: true, default: () => ({ destroy: () => undefined }) }));

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

describe(DocsNavbarComponent.name, () => {
    const render = (locale: DocsLocale): ComponentFixture<DocsNavbarComponent> => {
        TestBed.configureTestingModule({
            imports: [DocsNavbarComponent],
            providers: [provideRouter([]), provideDocsLocale(locale)]
        });

        const fixture = TestBed.createComponent(DocsNavbarComponent);

        fixture.detectChanges();

        return fixture;
    };

    /** The names of the controls that show nothing but an icon or the logo, in the order of the header. */
    const getNames = (fixture: ComponentFixture<DocsNavbarComponent>): (string | null)[] =>
        Array.from(
            fixture.nativeElement.querySelectorAll('.docs-navbar__logo, .docs-navbar__links [kbq-button]'),
            (control: Element) => control.getAttribute('aria-label')
        );

    it.each([
        [DocsLocale.En, ['Go to main page', 'Koobiq on Telegram', 'GitHub repository', 'Color theme', 'Menu']],
        [
            DocsLocale.Ru,
            ['Перейти на главную страницу', 'Koobiq в Telegram', 'Репозиторий на GitHub', 'Тема оформления', 'Меню']
        ]
    ])('names every control that shows only an icon in the %s locale', (locale, names) => {
        expect(getNames(render(locale))).toEqual(names);
    });

    it('tells whether the menu it toggles is expanded', () => {
        const fixture = render(DocsLocale.En);
        const toggle: HTMLElement = fixture.nativeElement.querySelector('.docs-navbar__mobile-menu');

        expect(toggle.getAttribute('aria-expanded')).toBe('false');

        toggle.click();
        fixture.detectChanges();

        expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('has no axe violations', async () => {
        expect(await axe(render(DocsLocale.En).nativeElement)).toHaveNoViolations();
    });
});
