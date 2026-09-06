import { Component, inject, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
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

    it('should render the svg input into a slot of its own', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag [svg]="svg" />
            `
        })
        class TestComponent {
            private readonly sanitizer = inject(DomSanitizer);
            readonly svg = this.sanitizer.bypassSecurityTrustHtml('<svg data-testid="flag-svg"></svg>');
        }

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.querySelector('.kbq-flag__svg > svg')).toBeTruthy();
    });

    it('should keep projected content when the svg input is set', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag [svg]="svg"><img src="AL.svg" alt="" /></kbq-flag>
            `
        })
        class TestComponent {
            private readonly sanitizer = inject(DomSanitizer);
            readonly svg = this.sanitizer.bypassSecurityTrustHtml('<svg data-testid="flag-svg"></svg>');
        }

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.querySelector('img')).toBeTruthy();
        expect(flag.querySelector('svg')).toBeTruthy();
    });

    it('should not render the svg slot when the input is unset', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.querySelector('.kbq-flag__svg')).toBeNull();
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

    it('should not apply a shape modifier class for the default rectangle shape', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).not.toContain('kbq-flag_square');
        expect(flag.classList).not.toContain('kbq-flag_circle');
    });

    it('should apply the square shape modifier class', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag shape="square" />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).toContain('kbq-flag_square');
        expect(flag.classList).not.toContain('kbq-flag_circle');
    });

    it('should apply the circle shape modifier class', () => {
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

    it('should apply the empty placeholder class', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag empty />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).toContain('kbq-flag_empty');
    });

    it('should not apply the empty placeholder class by default', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag />
            `
        })
        class TestComponent {}

        const flag = getFlag(createComponent(TestComponent));

        expect(flag.classList).not.toContain('kbq-flag_empty');
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

        it('should hide the flag from assistive tech when it has no accessible name', () => {
            @Component({
                imports: [KbqFlag],
                template: `
                    <kbq-flag />
                `
            })
            class TestComponent {}

            const flag = getFlag(createComponent(TestComponent));

            expect(flag.getAttribute('aria-hidden')).toBe('true');
            expect(flag.hasAttribute('role')).toBe(false);
            expect(flag.hasAttribute('aria-label')).toBe(false);
        });

        it('should treat an empty label as no accessible name', () => {
            @Component({
                imports: [KbqFlag],
                template: `
                    <kbq-flag label="" />
                `
            })
            class TestComponent {}

            const flag = getFlag(createComponent(TestComponent));

            expect(flag.getAttribute('aria-hidden')).toBe('true');
            expect(flag.hasAttribute('role')).toBe(false);
            expect(flag.hasAttribute('aria-label')).toBe(false);
        });
    });
});
