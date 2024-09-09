import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from './index';

describe('KbqLink', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqLinkModule, KbqIconModule],
            declarations: [
                KbqLinkBaseTestApp,
                KbqLinkIconTestApp,
                KbqLinkPrintTestApp,
                KbqLinkPseudoTestApp,
                KbqLinkNoUnderlineTestApp
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

    it('should has .kbq-link_print', fakeAsync(() => {
        const fixture = TestBed.createComponent(KbqLinkPrintTestApp);
        tick();
        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('[kbq-link]');

        expect(link.classList).toContain('kbq-link_print');
        expect(link.attributes.print.nodeValue).toContain('localhost:3003/');

        fixture.componentInstance.print = 'newUrl';
        tick();
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(link.attributes.print.nodeValue).toContain(fixture.componentInstance.print);
    }));

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
});

@Component({
    selector: 'kbq-link-base-test-app',
    template: `
        <a
            href="http://localhost:3003/"
            kbq-link
        >
            Отчет сканирования
        </a>
    `
})
class KbqLinkBaseTestApp {}

@Component({
    selector: 'kbq-link-print-test-app',
    template: `
        <a
            [print]="print"
            href="http://localhost:3003/"
            kbq-link
        >
            Отчет сканирования
        </a>
    `
})
class KbqLinkPrintTestApp {
    print: string = '';
}

@Component({
    selector: 'kbq-link-icon-test-app',
    template: `
        <a
            href="http://localhost:3003/"
            kbq-link
        >
            <span class="kbq-link__text">Отчет сканирования</span>
            <i kbq-icon="kbq-window-plus_16"></i>
        </a>
    `
})
class KbqLinkIconTestApp {}

@Component({
    selector: 'kbq-link-pseudo-test-app',
    template: `
        <a
            href="http://localhost:3003/"
            kbq-link
            pseudo
        >
            Отчет сканирования
        </a>
    `
})
class KbqLinkPseudoTestApp {}

@Component({
    selector: 'kbq-link-no-underline-test-app',
    template: `
        <a
            href="http://localhost:3003/"
            kbq-link
            noUnderline
        >
            Отчет сканирования
        </a>
    `
})
class KbqLinkNoUnderlineTestApp {}
