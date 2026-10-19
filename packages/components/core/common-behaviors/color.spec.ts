import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqColorDirective, KbqComponentColors } from './color';

@Component({
    selector: 'color-host',
    template: '',
    hostDirectives: [{ directive: KbqColorDirective, inputs: ['color'] }]
})
class ColorHost {
    readonly colored = inject(KbqColorDirective, { host: true });
}

@Component({
    imports: [ColorHost],
    template: `
        <color-host [color]="color" />
    `
})
class TestApp {
    color: string | null = null;
}

describe(KbqColorDirective.name, () => {
    let fixture: ComponentFixture<TestApp>;
    let colored: KbqColorDirective;
    let host: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        const debugElement = fixture.debugElement.children[0];

        colored = debugElement.injector.get(KbqColorDirective);
        host = debugElement.nativeElement;
        colored.setDefaultColor(KbqComponentColors.ContrastFade);
        fixture.detectChanges();
    });

    it('should follow the default color while nothing else gives one', () => {
        expect(colored.color()).toBe(KbqComponentColors.ContrastFade);

        colored.setDefaultColor(KbqComponentColors.Theme);
        fixture.detectChanges();

        expect(colored.color()).toBe(KbqComponentColors.Theme);
        expect(host.classList).toContain('kbq-theme');
    });

    it('should keep a color set in code when the default color changes', () => {
        colored.color.set(KbqComponentColors.Error);
        colored.setDefaultColor(KbqComponentColors.Theme);
        fixture.detectChanges();

        expect(colored.color()).toBe(KbqComponentColors.Error);
        expect(host.classList).toContain('kbq-error');
    });

    it('should drop a color set in code once the input changes', () => {
        colored.color.set(KbqComponentColors.Error);
        fixture.componentInstance.color = KbqComponentColors.Success;
        fixture.detectChanges();

        expect(colored.color()).toBe(KbqComponentColors.Success);
        expect(host.classList).toContain('kbq-success');
        expect(host.classList).not.toContain('kbq-error');
    });

    it('should update the color from the one it shows', () => {
        colored.color.update((color) =>
            color === KbqComponentColors.ContrastFade ? KbqComponentColors.Warning : color
        );
        colored.setDefaultColor(KbqComponentColors.Theme);

        expect(colored.color()).toBe(KbqComponentColors.Warning);
    });
});
