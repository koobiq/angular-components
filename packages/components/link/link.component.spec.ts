import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkModule } from './index';

describe('KbqLink', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqLinkModule,
                KbqIconModule,
                KbqLinkBaseTestApp,
                KbqLinkIconTestApp,
                KbqLinkPrintTestApp,
                KbqLinkPseudoTestApp,
                KbqLinkNoUnderlineTestApp,
                KbqLinkDisabledTestApp,
                KbqLinkPreserveWhitespacesTestApp,
                KbqLinkToggledTextTestApp,
                KbqLinkHrefTestApp,
                KbqLinkPseudoDisabledTestApp
            ]
        }).compileComponents();
    });

    it('should has .kbq-text-only', () => {
        const fixture = TestBed.createComponent(KbqLinkBaseTestApp);

        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.classList).toContain('kbq-text-only');
        expect(link.classList).not.toContain('kbq-text-with-icon');
        expect(link.attributes.tabIndex.nodeValue).toBe('0');
    });

    it('should has .kbq-text-with-icon', () => {
        const fixture = TestBed.createComponent(KbqLinkIconTestApp);

        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.classList).toContain('kbq-text-with-icon');
        expect(link.classList).not.toContain('kbq-text-only');
    });

    it('should has .kbq-link_print', () => {
        const fixture = TestBed.createComponent(KbqLinkPrintTestApp);

        // The href fallback is read where the host binding is evaluated, so it lands on the first pass.
        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.classList).toContain('kbq-link_print');
        expect(link.attributes.print.nodeValue).toContain('localhost:3003/');

        fixture.componentInstance.print.set('newUrl');
        fixture.detectChanges();

        expect(link.attributes.print.nodeValue).toBe('newUrl');
    });

    it('should follow a changing href into the print attribute', () => {
        const fixture = TestBed.createComponent(KbqLinkHrefTestApp);

        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.attributes.print.nodeValue).toContain('localhost:3003/first');

        fixture.componentInstance.href.set('http://localhost:3003/second');
        fixture.detectChanges();

        expect(link.attributes.print.nodeValue).toContain('localhost:3003/second');
    });

    it('should drop .kbq-link_print when print is unbound', () => {
        const fixture = TestBed.createComponent(KbqLinkBaseTestApp);

        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.classList).not.toContain('kbq-link_print');
        // Unchanged from before the review: the href still lands in the attribute, only the class is absent.
        expect(link.attributes.print.nodeValue).toContain('localhost:3003/');
    });

    it('should treat an explicit undefined print as not printable', () => {
        const fixture = TestBed.createComponent(KbqLinkPrintTestApp);

        fixture.componentInstance.print.set(undefined);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[kbq-link]').classList).not.toContain('kbq-link_print');
    });

    it('should has .kbq-link_pseudo', () => {
        const fixture = TestBed.createComponent(KbqLinkPseudoTestApp);

        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.classList).toContain('kbq-link_pseudo');
    });

    it('should has .kbq-link_no-underline', () => {
        const fixture = TestBed.createComponent(KbqLinkNoUnderlineTestApp);

        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.classList).toContain('kbq-link_no-underline');
    });
    it('should take a disabled link out of the tab order', () => {
        const fixture = TestBed.createComponent(KbqLinkDisabledTestApp);

        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.attributes.tabIndex.nodeValue).toBe('5');
        expect(link.classList).not.toContain('kbq-disabled');

        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        expect(link.attributes.tabIndex.nodeValue).toBe('-1');
        expect(link.classList).toContain('kbq-disabled');
        // `disabled` is not a valid attribute on an anchor, so the state is exposed via ARIA.
        expect(link.getAttribute('disabled')).toBeNull();
        expect(link.getAttribute('aria-disabled')).toBe('true');
    });

    it('should expose the disabled state via ARIA on a pseudo link too', () => {
        const fixture = TestBed.createComponent(KbqLinkPseudoDisabledTestApp);

        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.getAttribute('disabled')).toBeNull();
        expect(link.getAttribute('aria-disabled')).toBe('true');
    });

    it('should place the icon classes when whitespace is preserved', () => {
        const fixture = TestBed.createComponent(KbqLinkPreserveWhitespacesTestApp);

        fixture.detectChanges();

        const icon = fixture.nativeElement.querySelector('[kbq-icon]');

        expect(icon.classList).toContain('kbq-icon_right');
    });

    it('should replace the icon classes when a sibling node appears', async () => {
        const fixture = TestBed.createComponent(KbqLinkToggledTextTestApp);

        fixture.detectChanges();

        const icon = fixture.nativeElement.querySelector('[kbq-icon]');

        // A lone icon has no side to be on.
        expect(icon.classList).not.toContain('kbq-icon_left');

        fixture.componentInstance.showText.set(true);
        fixture.detectChanges();
        // The projected text is invisible to the content query, so the MutationObserver is what reacts.
        await new Promise((resolve) => setTimeout(resolve));
        fixture.detectChanges();

        expect(icon.classList).toContain('kbq-icon_left');
    });

    it('should keep reporting the bound tabIndex while disabled', () => {
        const fixture = TestBed.createComponent(KbqLinkDisabledTestApp);

        fixture.detectChanges();
        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        const link = fixture.debugElement.query(By.directive(KbqLink)).injector.get(KbqLink);

        expect(link.tabIndex()).toBe(5);
        expect(link.disabled()).toBe(true);
    });

    it('should let a forDisabledComponent consumer drive disabledSignal', () => {
        const fixture = TestBed.createComponent(KbqLinkDisabledTestApp);

        fixture.detectChanges();

        const linkElement = fixture.nativeElement.querySelector('[kbq-link]');
        const link = fixture.debugElement.query(By.directive(KbqLink)).injector.get(KbqLink);

        link.disabledSignal.set(true);
        fixture.detectChanges();

        expect(linkElement.classList).toContain('kbq-disabled');
    });
});

@Component({
    selector: 'kbq-link-base-test-app',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a href="http://localhost:3003/" kbq-link>Отчет сканирования</a>
    `
})
class KbqLinkBaseTestApp {}

@Component({
    selector: 'kbq-link-print-test-app',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a href="http://localhost:3003/" kbq-link [print]="print()">Отчет сканирования</a>
    `
})
class KbqLinkPrintTestApp {
    readonly print = signal<string | null | undefined>('');
}

@Component({
    selector: 'kbq-link-icon-test-app',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a href="http://localhost:3003/" kbq-link>
            <span class="kbq-link__text">Отчет сканирования</span>
            <i kbq-icon="kbq-arrow-up-right-from-square_16"></i>
        </a>
    `
})
class KbqLinkIconTestApp {}

@Component({
    selector: 'kbq-link-pseudo-test-app',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a href="http://localhost:3003/" kbq-link pseudo>Отчет сканирования</a>
    `
})
class KbqLinkPseudoTestApp {}

@Component({
    selector: 'kbq-link-no-underline-test-app',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a href="http://localhost:3003/" kbq-link noUnderline>Отчет сканирования</a>
    `
})
class KbqLinkNoUnderlineTestApp {}

@Component({
    selector: 'kbq-link-href-test-app',
    imports: [KbqLinkModule],
    template: `
        <a kbq-link print [href]="href()">Отчет сканирования</a>
    `
})
class KbqLinkHrefTestApp {
    readonly href = signal('http://localhost:3003/first');
}

@Component({
    selector: 'kbq-link-pseudo-disabled-test-app',
    imports: [KbqLinkModule],
    template: `
        <span kbq-link pseudo [disabled]="true">Отчет сканирования</span>
    `
})
class KbqLinkPseudoDisabledTestApp {}

@Component({
    selector: 'kbq-link-preserve-whitespaces-test-app',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a href="http://localhost:3003/" kbq-link>
            Отчет сканирования
            <i kbq-icon="kbq-arrow-up-right-from-square_16"></i>
        </a>
    `,
    // The whitespace text nodes around the icon must not shift it away from the edge.
    preserveWhitespaces: true
})
class KbqLinkPreserveWhitespacesTestApp {}

@Component({
    selector: 'kbq-link-toggled-text-test-app',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a href="http://localhost:3003/" kbq-link>
            <i kbq-icon="kbq-arrow-up-right-from-square_16"></i>
            @if (showText()) {
                Отчет сканирования
            }
        </a>
    `
})
class KbqLinkToggledTextTestApp {
    readonly showText = signal(false);
}

@Component({
    selector: 'kbq-link-disabled-test-app',
    imports: [KbqLinkModule],
    template: `
        <a href="http://localhost:3003/" kbq-link [disabled]="disabled()" [tabIndex]="5">Отчет сканирования</a>
    `
})
class KbqLinkDisabledTestApp {
    readonly disabled = signal(false);
}
