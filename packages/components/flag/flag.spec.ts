import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFlag } from './flag';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getFlag = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.debugElement.query(By.directive(KbqFlag)).nativeElement;

describe(KbqFlag.name, () => {
    it('should project the provided flag content', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag><img src="AL.svg" alt="" /></kbq-flag>
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).toContain('kbq-flag');
        expect(flag.querySelector('img')).toBeTruthy();
    });

    it('should apply the inset shadow by default', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).toContain('kbq-flag_shadow-inset');
    });

    it('should not apply the inset shadow when shadow is "none"', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag shadow="none" />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).not.toContain('kbq-flag_shadow-inset');
    });

    it('should apply the shape modifier class', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag shape="circle" />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).toContain('kbq-flag_circle');
        expect(flag.classList).not.toContain('kbq-flag_square');
    });

    it('should apply the size modifier class', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag size="24x16" />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).toContain('kbq-flag_size-24x16');
    });

    describe('accessibility', () => {
        it('should expose role="img" and aria-label when labelled', () => {
            @Component({
                imports: [KbqFlag],
                template: `
                    <kbq-flag label="Germany" />
                `
            })
            class TestComponent {}

            const flag = getFlag(createComponent(TestComponent));

            expect(flag.getAttribute('role')).toBe('img');
            expect(flag.getAttribute('aria-label')).toBe('Germany');
            expect(flag.hasAttribute('aria-hidden')).toBe(false);
        });

        it('should hide the flag from assistive tech when decorative', () => {
            @Component({
                imports: [KbqFlag],
                template: `
                    <kbq-flag decorative label="Germany" />
                `
            })
            class TestComponent {}

            const flag = getFlag(createComponent(TestComponent));

            expect(flag.getAttribute('aria-hidden')).toBe('true');
            expect(flag.hasAttribute('role')).toBe(false);
            expect(flag.hasAttribute('aria-label')).toBe(false);
        });

        it('should not set role/aria when neither labelled nor decorative', () => {
            @Component({
                imports: [KbqFlag],
                template: `
                    <kbq-flag />
                `
            })
            class TestComponent {}

            const flag = getFlag(createComponent(TestComponent));

            expect(flag.hasAttribute('role')).toBe(false);
            expect(flag.hasAttribute('aria-label')).toBe(false);
            expect(flag.hasAttribute('aria-hidden')).toBe(false);
        });
    });
});
