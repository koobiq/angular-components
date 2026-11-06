import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
import { KbqIcon, KbqIconRegistry } from '@koobiq/components/icon';

const svgOf = (path: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${path}"/></svg>`;

@Component({
    imports: [KbqIcon],
    template: `
        <i kbq-icon="kbq-plus_16"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {}

describe('triage: KbqIcon iconName assigned after init', () => {
    const hostOf = (fixture: ComponentFixture<TestApp>): HTMLElement => fixture.nativeElement.querySelector('i');

    // `iconName` is a plain field: without a notification an OnPush parent never re-reads it (the exhaustive
    // check reports NG0100), so the assignment is followed by the `markForCheck()` a consumer has to make.
    const assignIconName = (fixture: ComponentFixture<TestApp>, name: string) => {
        const iconElement = fixture.debugElement.query(By.directive(KbqIcon));

        (iconElement.componentInstance as KbqIcon).iconName = name;
        iconElement.injector.get(ChangeDetectorRef).markForCheck();
        fixture.detectChanges();
    };

    const register = (name: string, path: string) =>
        TestBed.inject(KbqIconRegistry).addSvgIconLiteral(
            name,
            TestBed.inject(DomSanitizer).bypassSecurityTrustHtml(svgOf(path))
        );

    it('DEFECT: a font icon switches only its class; the registered SVG is not resolved and max-height stays', () => {
        register('kbq-play_64', 'M1 1h14v14H1z');

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        expect(hostOf(fixture).querySelector('svg')).toBeNull();
        expect(hostOf(fixture).style.maxHeight).toBe('16px');

        assignIconName(fixture, 'kbq-play_64');

        expect(hostOf(fixture).classList).toContain('kbq-play_64');
        // Registered, yet never resolved: the icon stays a font glyph.
        expect(hostOf(fixture).querySelector('svg')).toBeNull();
        // The ceiling of the old name keeps clipping the 64px glyph.
        expect(hostOf(fixture).style.maxHeight).toBe('16px');
    });

    it('DEFECT: an SVG icon keeps showing the old SVG and gets no class for the new name', () => {
        register('kbq-plus_16', 'M0 0h16v16H0z');
        register('kbq-check_24', 'M1 8l4 4 8-8');

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        expect(hostOf(fixture).querySelector('svg')).not.toBeNull();

        assignIconName(fixture, 'kbq-check_24');

        const svgs = hostOf(fixture).querySelectorAll('svg');

        expect(svgs).toHaveLength(1);
        expect(svgs[0].querySelector('path')?.getAttribute('d')).toBe('M0 0h16v16H0z');
        expect(svgs[0].getAttribute('data-kbq-icon-name')).toBe('kbq-plus_16');
        expect(svgs[0].getAttribute('width')).toBe('16');
        expect(hostOf(fixture).classList).not.toContain('kbq-check_24');
        expect(hostOf(fixture).style.maxHeight).toBe('16px');
    });
});
