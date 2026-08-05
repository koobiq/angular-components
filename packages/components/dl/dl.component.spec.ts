import { Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});
