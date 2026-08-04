import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { BehaviorSubject, map } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsCopyButtonComponent } from './copy-button';

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

describe(DocsCopyButtonComponent.name, () => {
    let fixture: ComponentFixture<DocsCopyButtonComponent>;
    let copy: jest.Mock;

    const control = (): HTMLElement => fixture.nativeElement.querySelector('[kbq-link]');

    beforeEach(() => {
        copy = jest.fn().mockReturnValue(true);

        TestBed.configureTestingModule({
            imports: [DocsCopyButtonComponent],
            providers: [provideDocsLocale(DocsLocale.En), { provide: Clipboard, useValue: { copy } }]
        });

        fixture = TestBed.createComponent(DocsCopyButtonComponent);
        fixture.componentRef.setInput('contentToCopy', 'text to copy');
        fixture.detectChanges();
    });

    it('has no axe violations', async () => {
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    // The action used to sit on a non-focusable decorative <i>, making copying mouse-only (A11Y-01).
    it('exposes the copy action on a focusable control', () => {
        expect(control().getAttribute('role')).toBe('button');
        expect(control().getAttribute('tabindex')).toBe('0');
        expect(control().getAttribute('aria-label')).toBe('Copy');
    });

    it.each([
        ['click', new MouseEvent('click', { bubbles: true })],
        ['Enter', new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })],
        ['Space', new KeyboardEvent('keydown', { key: ' ', bubbles: true })]
    ])('copies the content on %s', (_name, event) => {
        control().dispatchEvent(event);
        fixture.detectChanges();

        expect(copy).toHaveBeenCalledWith('text to copy');
        expect(fixture.nativeElement.textContent).toContain('Copied');
    });

    it('does not copy when there is nothing to copy', () => {
        fixture.componentRef.setInput('contentToCopy', '');
        fixture.detectChanges();

        control().dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(copy).not.toHaveBeenCalled();
    });
});
