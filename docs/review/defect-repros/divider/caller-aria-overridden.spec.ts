import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqDivider } from '@koobiq/components/divider';

const createFixture = <T>(component: new () => T): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const dividerOf = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.debugElement.query(By.css('kbq-divider')).nativeElement;

describe('KbqDivider triage: caller ARIA attributes', () => {
    it('DEFECT: a static role written by the caller is replaced by separator', () => {
        expect(dividerOf(createFixture(CallerRoleDivider)).getAttribute('role')).toBe('separator');
    });

    it('DEFECT: a static role written by the caller on a decorative divider is replaced by presentation', () => {
        expect(dividerOf(createFixture(CallerRoleDecorativeDivider)).getAttribute('role')).toBe('presentation');
    });

    it('DEFECT: a static aria-orientation written by the caller is removed from a horizontal divider', () => {
        expect(dividerOf(createFixture(CallerOrientationDivider)).hasAttribute('aria-orientation')).toBe(false);
    });

    it('DEFECT: a static aria-orientation written by the caller is removed from a decorative vertical divider', () => {
        expect(dividerOf(createFixture(CallerOrientationDecorativeDivider)).hasAttribute('aria-orientation')).toBe(
            false
        );
    });
});

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider role="none" />
    `
})
class CallerRoleDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider role="separator" decorative />
    `
})
class CallerRoleDecorativeDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider aria-orientation="horizontal" />
    `
})
class CallerOrientationDivider {}

@Component({
    imports: [KbqDivider],
    template: `
        <kbq-divider aria-orientation="vertical" decorative vertical />
    `
})
class CallerOrientationDecorativeDivider {}
