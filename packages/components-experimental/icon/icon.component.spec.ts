import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideKbqIconsConfig } from './icon-config.provider';
import { KbqIconsModule } from './icon.module';

const mockKbqIcons = {
    AngleDownL16: '<svg></svg>'
};

@Component({
    template: '<kbqIcon name="AngleDownL16" [size]="size" [color]="color" [border]="borderWidth"></kbqIcon>'
})
class TestHostComponent {
    size = '32px';
    color = 'red';
    borderWidth = '2px';
}

@Component({
    template: '<kbqIcon name="AngleDownL16"></kbqIcon>'
})
class DefaultTestComponent {}

describe('KbqIcon', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let iconElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqIconsModule.withIcons(mockKbqIcons)],
            declarations: [TestHostComponent, DefaultTestComponent],
            providers: [
                provideKbqIconsConfig({
                    size: '24px',
                    color: 'black'
                })
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        iconElement = fixture.nativeElement.querySelector('kbqIcon');
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(iconElement).toBeTruthy();
    });

    it('should set icon size', () => {
        fixture.detectChanges();
        expect(iconElement.style.getPropertyValue('--kbq-icon__size')).toBe('32px');
    });

    it('should set icon color', () => {
        fixture.detectChanges();
        expect(iconElement.style.getPropertyValue('color')).toBe('red');
    });

    it('should set icon stroke width', () => {
        fixture.detectChanges(); // Apply initial bindings
        expect(iconElement.style.getPropertyValue('--kbq-icon__stroke-width')).toBe('2px');
    });

    it('should process and set SVG icon', () => {
        fixture.detectChanges(); // Apply initial bindings
        expect(iconElement.innerHTML).toContain('<svg></svg>');
    });

    it('should set default size and color from config if not provided by input', () => {
        const defaultFixture = TestBed.createComponent(DefaultTestComponent);
        const defaultIconElement = defaultFixture.nativeElement.querySelector('kbqIcon');
        defaultFixture.detectChanges();

        expect(defaultIconElement.style.getPropertyValue('--kbq-icon__size')).toBe('24px');
        expect(defaultIconElement.style.getPropertyValue('color')).toBe('black');
    });
});
