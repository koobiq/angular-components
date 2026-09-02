import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqComponentColors, ThemePalette } from '@koobiq/components/core';
import { KbqProgressSpinnerModule, ProgressSpinnerMode, ProgressSpinnerSize } from './index';

/** `MAX_DASH_ARRAY - percentage * MAX_DASH_ARRAY`, with `MAX_DASH_ARRAY = 295`. */
const dashOffsetPairs: [value: number, dashOffset: string][] = [
    [40, '177%'],
    [-50, '295%'],
    [140, '0%']
];

describe('KbqProgressSpinner', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;

    /** The spinner driven by the test component's signals. */
    let host: HTMLElement;
    let circle: SVGCircleElement;

    /** A spinner with no bindings at all, to assert the defaults. */
    let defaultHost: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqProgressSpinnerModule, TestApp] });

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
        host = fixture.debugElement.query(By.css('.first')).nativeElement;
        circle = host.querySelector('.kbq-progress-spinner__circle')!;
        defaultHost = fixture.debugElement.query(By.css('.default')).nativeElement;
    });

    it('should apply class based on color attribute', () => {
        Object.keys(ThemePalette).forEach((key) => {
            if (!ThemePalette[key]) return;

            testComponent.color.set(ThemePalette[key]);
            fixture.detectChanges();

            expect(host.classList.contains(`kbq-${ThemePalette[key]}`)).toBe(true);
        });
    });

    it(`should have the ${KbqComponentColors.Theme} color by default`, () => {
        expect(defaultHost.classList.contains(`kbq-${KbqComponentColors.Theme}`)).toBe(true);
    });

    it('should clamp the value into a stroke offset', () => {
        dashOffsetPairs.forEach(([value, dashOffset]) => {
            testComponent.value.set(value);
            fixture.detectChanges();

            expect(circle.style.strokeDashoffset).toBe(dashOffset);
        });
    });

    it('should render an empty circle by default', () => {
        const defaultCircle = defaultHost.querySelector<SVGCircleElement>('.kbq-progress-spinner__circle')!;

        expect(defaultCircle.style.strokeDashoffset).toBe('295%');
    });

    it('should not offset the stroke in indeterminate mode', () => {
        testComponent.value.set(40);
        testComponent.mode.set('indeterminate');
        fixture.detectChanges();

        expect(circle.style.strokeDashoffset).toBe('');
    });

    it('should mark the host as indeterminate', () => {
        expect(host.classList.contains('kbq-progress-spinner_indeterminate')).toBe(false);

        testComponent.mode.set('indeterminate');
        fixture.detectChanges();

        expect(host.classList.contains('kbq-progress-spinner_indeterminate')).toBe(true);
    });

    it('should be determinate by default', () => {
        expect(defaultHost.classList.contains('kbq-progress-spinner_indeterminate')).toBe(false);
    });

    it('should grow the circle for the big size', () => {
        expect(circle.getAttribute('r')).toBe('42.5%');
        expect(host.classList.contains('kbq-progress-spinner_big')).toBe(false);

        testComponent.size.set('big');
        fixture.detectChanges();

        expect(circle.getAttribute('r')).toBe('47%');
        expect(host.classList.contains('kbq-progress-spinner_big')).toBe(true);
    });

    it('should set id attribute', () => {
        testComponent.id.set('foo');
        fixture.detectChanges();

        expect(host.getAttribute('id')).toBe('foo');
    });

    it('should auto generate a unique id', () => {
        expect(defaultHost.getAttribute('id')).toMatch(/^kbq-progress-spinner-/);
        expect(defaultHost.getAttribute('id')).not.toBe(host.getAttribute('id'));
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqProgressSpinnerModule],
    template: `
        <kbq-progress-spinner
            class="first"
            [id]="id()"
            [color]="color()"
            [value]="value()"
            [mode]="mode()"
            [size]="size()"
        />
        <kbq-progress-spinner class="default" />
    `
})
class TestApp {
    readonly color = signal<ThemePalette>(ThemePalette.Primary);
    readonly value = signal(0);
    readonly mode = signal<ProgressSpinnerMode>('determinate');
    readonly size = signal<ProgressSpinnerSize>('compact');
    readonly id = signal('test-spinner');
}
