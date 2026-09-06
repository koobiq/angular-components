import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqDivider } from './divider.component';
import { KbqDividerModule } from './divider.module';

const createFixture = <T>(component: new () => T): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const dividerOf = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.debugElement.query(By.css('kbq-divider')).nativeElement;

describe('KbqDivider', () => {
    describe('orientation', () => {
        it('should be horizontal by default', () => {
            const divider = dividerOf(createFixture(DefaultDivider));

            expect(divider.classList).toContain('kbq-divider');
            expect(divider.classList).toContain('kbq-divider_horizontal');
            expect(divider.classList).not.toContain('kbq-divider_vertical');
        });

        it('should swap the orientation class when vertical', () => {
            const divider = dividerOf(createFixture(VerticalDivider));

            expect(divider.classList).toContain('kbq-divider_vertical');
            expect(divider.classList).not.toContain('kbq-divider_horizontal');
        });

        it('should coerce a bare attribute to true', () => {
            expect(dividerOf(createFixture(BareAttributeDivider)).classList).toContain('kbq-divider_vertical');
        });
    });

    describe('paddings', () => {
        it('should be on by default', () => {
            expect(dividerOf(createFixture(DefaultDivider)).classList).toContain('kbq-divider_paddings');
        });

        it('should be off when bound to false', () => {
            expect(dividerOf(createFixture(WithoutPaddingsDivider)).classList).not.toContain('kbq-divider_paddings');
        });

        it('should coerce the "false" string to false', () => {
            expect(dividerOf(createFixture(StringFalsePaddingsDivider)).classList).not.toContain(
                'kbq-divider_paddings'
            );
        });
    });

    describe('a11y', () => {
        it('should expose a horizontal separator by default', () => {
            const divider = dividerOf(createFixture(DefaultDivider));

            expect(divider.getAttribute('role')).toBe('separator');
            expect(divider.hasAttribute('aria-orientation')).toBe(false);
            expect(divider.hasAttribute('aria-hidden')).toBe(false);
        });

        it('should report the orientation of a vertical separator', () => {
            expect(dividerOf(createFixture(VerticalDivider)).getAttribute('aria-orientation')).toBe('vertical');
        });

        it('should drop a decorative divider out of the accessibility tree', () => {
            expect(dividerOf(createFixture(DecorativeDivider)).getAttribute('role')).toBe('presentation');
        });

        it('should not report an orientation for a decorative divider', () => {
            expect(dividerOf(createFixture(DecorativeVerticalDivider)).hasAttribute('aria-orientation')).toBe(false);
        });

        it('should leave an aria-hidden written by the caller alone', () => {
            expect(dividerOf(createFixture(HiddenDivider)).getAttribute('aria-hidden')).toBe('true');
        });
    });
});

@Component({
    imports: [KbqDividerModule],
    template: `
        <kbq-divider />
    `
})
class DefaultDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider [vertical]="true" />
    `
})
class VerticalDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider vertical />
    `
})
class BareAttributeDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider [paddings]="false" />
    `
})
class WithoutPaddingsDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider paddings="false" />
    `
})
class StringFalsePaddingsDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider decorative />
    `
})
class DecorativeDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider decorative vertical />
    `
})
class DecorativeVerticalDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider aria-hidden="true" />
    `
})
class HiddenDivider {}
