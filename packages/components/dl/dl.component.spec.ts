import { Provider, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { KbqDlAlign, KbqDlComponent } from './dl.component';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getDlElement = ({ nativeElement }: ComponentFixture<unknown>): HTMLElement => nativeElement;

const createDl = (): ComponentFixture<KbqDlComponent> => {
    TestBed.configureTestingModule({ imports: [KbqDlComponent] });

    return TestBed.createComponent(KbqDlComponent);
};

/**
 * Stubs the host geometry the way a browser would report it: a number, a getter for a changing width, or `null`
 * for a host without a box. jsdom never lays anything out, so without the stub `getClientRects()` returns nothing
 * in every test and the width branches stay uncovered.
 */
const stubHostWidth = (fixture: ComponentFixture<unknown>, width: number | null | (() => number | null)): void => {
    Object.defineProperty(getDlElement(fixture), 'getClientRects', {
        configurable: true,
        value: () => {
            const resolved = typeof width === 'function' ? width() : width;

            return resolved === null ? [] : [{ width: resolved } as DOMRect];
        }
    });
};

describe(KbqDlComponent.name, () => {
    it('should use start alignment by default', () => {
        const fixture = createComponent(KbqDlComponent);

        expect(fixture.componentInstance.verticalAlign()).toBe('start');
        expect(fixture.componentInstance.horizontalAlign()).toBe('start');
        expect(getDlElement(fixture).className).toBe('kbq-dl');
    });

    it.each<{ align: Exclude<KbqDlAlign, 'start'>; className: string }>([
        { align: 'center', className: 'kbq-dl_vertical-align-center' },
        { align: 'end', className: 'kbq-dl_vertical-align-end' }
    ])('should apply $align vertical alignment', ({ align, className }) => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('verticalAlign', align);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain(className);
    });

    it.each<{ align: Exclude<KbqDlAlign, 'start'>; className: string }>([
        { align: 'center', className: 'kbq-dl_horizontal-align-center' },
        { align: 'end', className: 'kbq-dl_horizontal-align-end' }
    ])('should apply $align horizontal alignment', ({ align, className }) => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('horizontalAlign', align);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain(className);
    });

    it('should apply layout classes', () => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('wide', true);
        fixture.componentRef.setInput('vertical', true);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_wide');
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should choose the vertical layout during the first change detection when the host is at the breakpoint', () => {
        const fixture = createDl();

        stubHostWidth(fixture, 400);
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should keep the horizontal layout during the first change detection when the host is wider than the breakpoint', () => {
        const fixture = createDl();

        stubHostWidth(fixture, 401);
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should keep the consumer-set vertical input over the measured width', () => {
        const fixture = createDl();

        stubHostWidth(fixture, 400);
        fixture.componentRef.setInput('vertical', false);
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should keep the default horizontal layout when the host has no box at init', () => {
        const fixture = createDl();

        stubHostWidth(fixture, null);
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should re-evaluate the layout on window resize, debounced', fakeAsync(() => {
        const fixture = createDl();
        let width: number | null = 500;

        stubHostWidth(fixture, () => width);
        fixture.autoDetectChanges();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        width = 400;
        window.dispatchEvent(new Event('resize'));
        tick(99);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        tick(1);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');

        width = 500;
        window.dispatchEvent(new Event('resize'));
        tick(100);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        // a host left without a box keeps the layout it last had
        width = null;
        window.dispatchEvent(new Event('resize'));
        tick(100);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    }));
});
