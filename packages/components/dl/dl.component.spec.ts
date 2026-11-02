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
        const fixture = TestBed.createComponent(KbqDlComponent);

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 400 } as DOMRect]
        });
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should keep the horizontal layout during the first change detection when the host is wider than the breakpoint', () => {
        const fixture = TestBed.createComponent(KbqDlComponent);

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 401 } as DOMRect]
        });
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should keep the consumer-set vertical input over the measured width', () => {
        const fixture = TestBed.createComponent(KbqDlComponent);

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 400 } as DOMRect]
        });
        fixture.componentRef.setInput('vertical', false);
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should re-evaluate the layout on window resize, debounced', fakeAsync(() => {
        TestBed.configureTestingModule({ imports: [KbqDlComponent] });
        const fixture = TestBed.createComponent(KbqDlComponent);
        let width = 500;

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width } as DOMRect]
        });
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
    }));
});
