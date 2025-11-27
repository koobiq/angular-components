import { Component, Provider, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqResizable, KbqResizer, KbqResizerDirection } from './resizer';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component, NoopAnimationsModule], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getResizerElement = ({ debugElement }: ComponentFixture<unknown>): HTMLElement => {
    return debugElement.query(By.directive(KbqResizer)).nativeElement;
};

@Component({
    standalone: true,
    imports: [KbqResizable, KbqResizer],
    selector: 'test-resizer',
    template: `
        <div kbqResizable>
            <div [kbqResizer]="direction()" (sizeChange)="sizeChange($event)"></div>
        </div>
    `
})
export class TestResizer {
    readonly resizer = viewChild.required(KbqResizer);
    readonly resizable = viewChild.required(KbqResizable);

    readonly direction = signal<KbqResizerDirection>([1, 0]);

    readonly sizeChange = jest.fn();
}

describe(KbqResizer.name, () => {
    it('should apply correct cursor for horizontal (right) resize', () => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.direction.set([1, 0]);
        fixture.detectChanges();

        expect(getResizerElement(fixture).style.cursor).toBe('ew-resize');
    });

    it('should apply correct cursor for vertical (down) resize', () => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.direction.set([0, 1]);
        fixture.detectChanges();

        expect(getResizerElement(fixture).style.cursor).toBe('ns-resize');
    });

    it('should apply correct cursor for diagonal (right-down) resize', () => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.direction.set([1, 1]);
        fixture.detectChanges();

        expect(getResizerElement(fixture).style.cursor).toBe('nwse-resize');
    });
});
