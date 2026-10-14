import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { KBQ_ICON_ERROR_STATE_CONTEXT } from './icon-error-state-context';
import { KbqIconRegistry } from './icon-registry';
import { KbqIcon } from './icon.component';

const svgOf = (path: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${path}"/></svg>`;

@Component({
    imports: [KbqIcon],
    template: `
        <i [kbq-icon]="name()"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly name = signal<string | undefined>('star_16');
}

@Component({
    imports: [KbqIcon],
    template: `
        <i kbq-icon="star_16" [autoColor]="autoColor()"></i>
    `,
    providers: [{ provide: KBQ_ICON_ERROR_STATE_CONTEXT, useValue: { errorState: signal(true) } }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class AutoColorIcon {
    readonly autoColor = signal<boolean | undefined>(true);
}

describe('KbqIcon', () => {
    let registry: KbqIconRegistry;
    let sanitizer: DomSanitizer;
    let fixture: ComponentFixture<TestApp>;

    const host = (): HTMLElement => fixture.nativeElement.querySelector('.kbq-icon');

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

        registry = TestBed.inject(KbqIconRegistry);
        sanitizer = TestBed.inject(DomSanitizer);
    });

    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('should render a registered icon as inline SVG instead of the font class', () => {
        registry.addSvgIconLiteral('star_16', sanitizer.bypassSecurityTrustHtml(svgOf('M0 0h16v16H0z')));

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        expect(host().querySelector('svg')).not.toBeNull();
        expect(host().classList).not.toContain('star_16');
    });

    it('should keep the font class for a name the registry does not know', () => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        expect(host().querySelector('svg')).toBeNull();
        expect(host().classList).toContain('star_16');
    });

    it('should render an SVG that arrives after the first render', async () => {
        registry.addSvgIcon('star_16', sanitizer.bypassSecurityTrustResourceUrl('/icons/star.svg'));

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        expect(host().classList).toContain('star_16');

        TestBed.inject(HttpTestingController).expectOne('/icons/star.svg').flush(svgOf('M0 0h16v16H0z'));
        await fixture.whenStable();

        expect(host().querySelector('svg')).not.toBeNull();
        expect(host().classList).not.toContain('star_16');
    });

    it('should replace the SVG when the name changes', () => {
        registry.addSvgIconLiteral('star_16', sanitizer.bypassSecurityTrustHtml(svgOf('M0 0h16v16H0z')));
        registry.addSvgIconLiteral('check_16', sanitizer.bypassSecurityTrustHtml(svgOf('M1 8l4 4 8-8')));

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        fixture.componentInstance.name.set('check_16');
        fixture.detectChanges();

        const svgs = host().querySelectorAll('svg');

        expect(svgs).toHaveLength(1);
        expect(svgs[0].querySelector('path')?.getAttribute('d')).toBe('M1 8l4 4 8-8');
    });

    it('should drop the font class once the bound name turns undefined', () => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        fixture.componentInstance.name.set(undefined);
        fixture.detectChanges();

        expect(host().classList).not.toContain('star_16');
    });

    it('should stop taking the error color once the bound autoColor turns undefined', () => {
        const autoColorFixture = TestBed.createComponent(AutoColorIcon);

        autoColorFixture.detectChanges();

        const icon: HTMLElement = autoColorFixture.nativeElement.querySelector('.kbq-icon');

        expect(icon.classList).toContain('kbq-error');

        autoColorFixture.componentInstance.autoColor.set(undefined);
        autoColorFixture.detectChanges();

        expect(icon.classList).not.toContain('kbq-error');
    });
});
