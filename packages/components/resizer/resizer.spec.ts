import { Component, Provider, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqResizable, KbqResizer, KbqResizerDirection } from './resizer';

/**
 * Geometry of a resizable element whose two box models disagree: 100x50 of content, 10px of padding
 * on every side and a 1px border, so the border box is 122x72.
 *
 * The gap is what the sizing tests below turn on. `getComputedStyle().width` is the used content-box
 * width whatever `box-sizing` says, while `getBoundingClientRect()` is always the border box, so a
 * directive that reads one and writes the other moves the element on the first drag.
 */
const CONTENT_BOX = { width: 100, height: 50 };
const BORDER_BOX = { width: 122, height: 72 };

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component, NoopAnimationsModule], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getResizerElement = ({ debugElement }: ComponentFixture<unknown>): HTMLElement => {
    return debugElement.query(By.directive(KbqResizer)).nativeElement;
};

const getResizableElement = ({ debugElement }: ComponentFixture<unknown>): HTMLElement => {
    return debugElement.query(By.directive(KbqResizable)).nativeElement;
};

/** jsdom computes no layout, so the box model the directive branches on has to be supplied. */
const windowStub = (boxSizing: 'content-box' | 'border-box'): Provider => ({
    provide: KBQ_WINDOW,
    useValue: {
        getComputedStyle: () => ({
            boxSizing,
            width: `${CONTENT_BOX.width}px`,
            height: `${CONTENT_BOX.height}px`
        })
    }
});

@Component({
    selector: 'test-resizer',
    imports: [KbqResizable, KbqResizer],
    standalone: true,
    template: `
        <div kbqResizable>
            <div [kbqResizer]="direction()" [cursor]="cursor()" (sizeChange)="sizeChange($event)"></div>
        </div>
    `
})
export class TestResizer {
    readonly resizer = viewChild.required(KbqResizer);
    readonly resizable = viewChild.required(KbqResizable);

    readonly direction = signal<KbqResizerDirection>([1, 0]);
    readonly cursor = signal<string | null>(null);

    readonly sizeChange = jest.fn();
}

describe(KbqResizer.name, () => {
    it.each<{ direction: KbqResizerDirection; cursor: string; description: string }>([
        { direction: [1, 0], cursor: 'ew-resize', description: 'right' },
        { direction: [-1, 0], cursor: 'ew-resize', description: 'left' },
        { direction: [0, 1], cursor: 'ns-resize', description: 'down' },
        { direction: [0, -1], cursor: 'ns-resize', description: 'up' },
        { direction: [1, 1], cursor: 'nwse-resize', description: 'right-down' },
        { direction: [-1, -1], cursor: 'nwse-resize', description: 'left-up' },
        { direction: [1, -1], cursor: 'nesw-resize', description: 'right-up' },
        { direction: [-1, 1], cursor: 'nesw-resize', description: 'left-down' },
        { direction: [0, 0], cursor: 'default', description: 'no resize' }
    ])('should apply correct cursor for $description resize', ({ direction, cursor }) => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.direction.set(direction);
        fixture.detectChanges();

        expect(getResizerElement(fixture).style.cursor).toBe(cursor);
    });

    it('should override the direction-derived cursor with the `cursor` input', () => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.direction.set([1, 0]);
        fixture.componentInstance.cursor.set('col-resize');
        fixture.detectChanges();

        expect(getResizerElement(fixture).style.cursor).toBe('col-resize');
    });

    it('should fall back to the direction-derived cursor when the `cursor` input is empty', () => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.direction.set([0, 1]);
        fixture.componentInstance.cursor.set('col-resize');
        fixture.detectChanges();

        expect(getResizerElement(fixture).style.cursor).toBe('col-resize');

        fixture.componentInstance.cursor.set(null);
        fixture.detectChanges();

        expect(getResizerElement(fixture).style.cursor).toBe('ns-resize');
    });

    it('should emit sizeChange event when resizing', async () => {
        const fixture = createComponent(TestResizer);

        getResizerElement(fixture).dispatchEvent(new MouseEvent('pointerdown'));

        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledTimes(3);
    });

    it('should NOT emit sizeChange event when no pointerdown', async () => {
        const fixture = createComponent(TestResizer);

        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledTimes(0);
    });

    it('should NOT emit sizeChange event when mouse button is released (buttons = 0)', async () => {
        const fixture = createComponent(TestResizer);

        getResizerElement(fixture).dispatchEvent(new MouseEvent('pointerdown'));

        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 0 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 0 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 0 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledTimes(0);
    });

    it.each<{ boxSizing: 'content-box' | 'border-box'; width: number; height: number }>([
        // Under `content-box` the declared size is the content, so the drag starts from 100x50 …
        { boxSizing: 'content-box', width: CONTENT_BOX.width + 30, height: CONTENT_BOX.height + 20 },
        // … and under `border-box` it already contains the padding and border, so from 122x72.
        { boxSizing: 'border-box', width: BORDER_BOX.width + 30, height: BORDER_BOX.height + 20 }
    ])('should size from the $boxSizing baseline while resizing', ({ boxSizing, width, height }) => {
        const fixture = createComponent(TestResizer, [windowStub(boxSizing)]);

        fixture.componentInstance.direction.set([1, 1]);
        fixture.detectChanges();

        const resizable = getResizableElement(fixture);

        jest.spyOn(resizable, 'getBoundingClientRect').mockReturnValue(BORDER_BOX as DOMRect);

        getResizerElement(fixture).dispatchEvent(new MouseEvent('pointerdown'));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 30, clientY: 20 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledWith({ width, height });
        expect(resizable.style.width).toBe(`${width}px`);
        expect(resizable.style.height).toBe(`${height}px`);
    });

    it('should only write the axis it was given a direction for', () => {
        const fixture = createComponent(TestResizer, [windowStub('content-box')]);

        fixture.componentInstance.direction.set([1, 0]);
        fixture.detectChanges();

        const resizable = getResizableElement(fixture);

        getResizerElement(fixture).dispatchEvent(new MouseEvent('pointerdown'));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 30, clientY: 20 }));

        expect(resizable.style.width).toBe(`${CONTENT_BOX.width + 30}px`);
        expect(resizable.style.height).toBe('');
        // The height still travels in the payload, unchanged, because it is the baseline this drag
        // started from rather than a value the pointer moved.
        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledWith({
            width: CONTENT_BOX.width + 30,
            height: CONTENT_BOX.height
        });
    });

    it('should stop resizing on pointerup event', async () => {
        const fixture = createComponent(TestResizer);

        getResizerElement(fixture).dispatchEvent(new MouseEvent('pointerdown'));

        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledTimes(2);

        document.dispatchEvent(new MouseEvent('pointerup'));

        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledTimes(2);
    });
});
