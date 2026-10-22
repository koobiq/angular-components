import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqIcon, KbqIconRegistry } from '@koobiq/components/icon';

@Component({
    imports: [KbqIcon],
    template: `
        <i kbq-icon="logo" [iconSize]="iconSize()"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly iconSize = signal<number | undefined>(24);
}

describe('triage: KbqIcon iconSize turned undefined on an unsized name', () => {
    it('DEFECT: the inserted SVG keeps the old width and height while the host max-height is removed', () => {
        TestBed.inject(KbqIconRegistry).addSvgIconLiteral(
            'logo',
            TestBed.inject(DomSanitizer).bypassSecurityTrustHtml(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>'
            )
        );

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('i');
        const svg = host.querySelector('svg')!;

        expect(svg.getAttribute('width')).toBe('24');
        expect(host.style.maxHeight).toBe('24px');

        fixture.componentInstance.iconSize.set(undefined);
        fixture.detectChanges();

        expect(host.querySelector('svg')).toBe(svg);
        expect(svg.getAttribute('width')).toBe('24');
        expect(svg.getAttribute('height')).toBe('24');
        expect(host.style.maxHeight).toBe('');
    });
});
