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

const createPointerEvent = (
    type: string,
    { isPrimary = true, pointerId = 1, ...init }: MouseEventInit & { isPrimary?: boolean; pointerId?: number } = {}
): PointerEvent => {
    const event = new MouseEvent(type, init);

    Object.defineProperties(event, {
        isPrimary: { value: isPrimary },
        pointerId: { value: pointerId }
    });

    return event as PointerEvent;
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
            <div
                [cursor]="cursor()"
                [disableSizeUpdate]="disableSizeUpdate()"
                [kbqResizer]="direction()"
                (resizeStart)="resizeStart($event)"
                (sizeChange)="sizeChange($event)"
            ></div>
        </div>
    `
})
export class TestResizer {
    readonly resizer = viewChild.required(KbqResizer);
    readonly resizable = viewChild.required(KbqResizable);

    readonly direction = signal<KbqResizerDirection>([1, 0]);
    readonly cursor = signal<string | null>(null);
    readonly disableSizeUpdate = signal(false);

    readonly resizeStart = jest.fn();
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

    it('should apply the current resize cursor to the document during drag and restore the previous cursor', () => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.cursor.set('col-resize');
        fixture.detectChanges();
        document.body.style.setProperty('cursor', 'wait', 'important');

        getResizerElement(fixture).dispatchEvent(createPointerEvent('pointerdown'));

        expect(document.body.style.cursor).toBe('col-resize');
        expect(document.body.style.getPropertyPriority('cursor')).toBe('important');

        fixture.componentInstance.cursor.set('e-resize');
        fixture.detectChanges();

        expect(document.body.style.cursor).toBe('e-resize');

        document.dispatchEvent(createPointerEvent('pointerup'));

        expect(document.body.style.cursor).toBe('wait');
        expect(document.body.style.getPropertyPriority('cursor')).toBe('important');

        document.body.style.removeProperty('cursor');
    });

    it('should restore the document cursor when the pointer is cancelled', () => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.cursor.set('col-resize');
        fixture.detectChanges();

        getResizerElement(fixture).dispatchEvent(createPointerEvent('pointerdown'));

        expect(document.body.style.cursor).toBe('col-resize');

        document.dispatchEvent(createPointerEvent('pointercancel'));

        expect(document.body.style.cursor).toBe('');
    });

    it('should restore the document cursor when pointer capture is lost', () => {
        const fixture = createComponent(TestResizer);
        const resizer = getResizerElement(fixture);

        fixture.componentInstance.cursor.set('col-resize');
        fixture.detectChanges();

        resizer.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 7 }));
        resizer.dispatchEvent(createPointerEvent('lostpointercapture', { pointerId: 7 }));

        expect(document.body.style.cursor).toBe('');
    });

    it('should restore the document cursor when destroyed during drag', () => {
        const fixture = createComponent(TestResizer);

        fixture.componentInstance.cursor.set('col-resize');
        fixture.detectChanges();

        getResizerElement(fixture).dispatchEvent(createPointerEvent('pointerdown'));

        expect(document.body.style.cursor).toBe('col-resize');

        fixture.destroy();

        expect(document.body.style.cursor).toBe('');
    });

    it('should ignore secondary buttons and non-primary pointers', () => {
        const fixture = createComponent(TestResizer);
        const resizer = getResizerElement(fixture);

        resizer.dispatchEvent(createPointerEvent('pointerdown', { button: 2 }));
        resizer.dispatchEvent(createPointerEvent('pointerdown', { isPrimary: false, pointerId: 2 }));
        document.dispatchEvent(createPointerEvent('pointermove', { buttons: 1, clientX: 30 }));

        expect(fixture.componentInstance.sizeChange).not.toHaveBeenCalled();
        expect(document.body.style.cursor).toBe('');
    });

    it('should not start dragging when both resize directions are disabled', () => {
        const fixture = createComponent(TestResizer);
        const resizer = getResizerElement(fixture);

        fixture.componentInstance.direction.set([0, 0]);
        fixture.detectChanges();

        resizer.dispatchEvent(createPointerEvent('pointerdown'));
        document.dispatchEvent(createPointerEvent('pointermove', { buttons: 1, clientX: 30 }));

        expect(fixture.componentInstance.sizeChange).not.toHaveBeenCalled();
        expect(document.body.style.cursor).toBe('');
    });

    it('should ignore events from another pointer while dragging', () => {
        const fixture = createComponent(TestResizer);
        const resizer = getResizerElement(fixture);

        resizer.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 7 }));
        document.dispatchEvent(createPointerEvent('pointermove', { buttons: 1, clientX: 30, pointerId: 8 }));
        document.dispatchEvent(createPointerEvent('pointerup', { pointerId: 8 }));

        expect(fixture.componentInstance.sizeChange).not.toHaveBeenCalled();
        expect(document.body.style.cursor).toBe('ew-resize');

        document.dispatchEvent(createPointerEvent('pointermove', { buttons: 1, clientX: 30, pointerId: 7 }));
        document.dispatchEvent(createPointerEvent('pointerup', { pointerId: 7 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledTimes(1);
        expect(document.body.style.cursor).toBe('');
    });

    it('should capture only the active pointer and release it when the drag finishes', () => {
        const fixture = createComponent(TestResizer);
        const resizer = getResizerElement(fixture);
        const setPointerCapture = jest.fn();
        const releasePointerCapture = jest.fn();

        Object.defineProperties(resizer, {
            hasPointerCapture: { value: () => true },
            releasePointerCapture: { value: releasePointerCapture },
            setPointerCapture: { value: setPointerCapture }
        });

        resizer.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 7 }));
        resizer.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 8 }));

        expect(setPointerCapture).toHaveBeenCalledTimes(1);
        expect(setPointerCapture).toHaveBeenCalledWith(7);

        document.dispatchEvent(createPointerEvent('pointerup', { pointerId: 7 }));

        expect(releasePointerCapture).toHaveBeenCalledWith(7);
        expect(document.body.style.cursor).toBe('');
    });

    it('should emit resizeStart with the element size when a drag begins', () => {
        const fixture = createComponent(TestResizer, [windowStub('content-box')]);

        getResizerElement(fixture).dispatchEvent(createPointerEvent('pointerdown'));

        expect(fixture.componentInstance.resizeStart).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.resizeStart).toHaveBeenCalledWith(CONTENT_BOX);
    });

    it('should NOT emit resizeStart for pointerdowns that do not start a drag', () => {
        const fixture = createComponent(TestResizer);
        const resizer = getResizerElement(fixture);

        resizer.dispatchEvent(createPointerEvent('pointerdown', { button: 2 }));
        resizer.dispatchEvent(createPointerEvent('pointerdown', { isPrimary: false, pointerId: 2 }));

        expect(fixture.componentInstance.resizeStart).not.toHaveBeenCalled();
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
        expect(document.body.style.cursor).toBe('');
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

    describe('disableSizeUpdate', () => {
        /** A resizer in controlled mode, dragged along both axes so either write would show up. */
        const dragControlled = (clientX: number, clientY: number) => {
            const fixture = createComponent(TestResizer, [windowStub('content-box')]);

            fixture.componentInstance.direction.set([1, 1]);
            fixture.componentInstance.disableSizeUpdate.set(true);
            fixture.detectChanges();

            getResizerElement(fixture).dispatchEvent(new MouseEvent('pointerdown'));
            document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX, clientY }));

            return fixture;
        };

        it('should leave the resizable element unstyled', () => {
            const fixture = dragControlled(30, 20);
            const resizable = getResizableElement(fixture);

            expect(resizable.style.width).toBe('');
            expect(resizable.style.height).toBe('');
        });

        it('should still report the size the drag asks for', () => {
            const fixture = dragControlled(30, 20);

            expect(fixture.componentInstance.resizeStart).toHaveBeenCalledWith(CONTENT_BOX);
            expect(fixture.componentInstance.sizeChange).toHaveBeenCalledWith({
                width: CONTENT_BOX.width + 30,
                height: CONTENT_BOX.height + 20
            });
        });

        it('should measure every move from where the drag started', () => {
            const fixture = dragControlled(30, 20);

            // A second move reports the pointer's total travel, not the previous report plus this step: the
            // baseline is the size at pointer-down, so a host that clamps or ignores a move cannot make the
            // reported sizes drift for the rest of the drag.
            document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 50, clientY: 35 }));

            expect(fixture.componentInstance.sizeChange).toHaveBeenLastCalledWith({
                width: CONTENT_BOX.width + 50,
                height: CONTENT_BOX.height + 35
            });
        });

        it('should write the size again once size updates are enabled', () => {
            const fixture = createComponent(TestResizer, [windowStub('content-box')]);

            fixture.componentInstance.disableSizeUpdate.set(true);
            fixture.detectChanges();

            getResizerElement(fixture).dispatchEvent(new MouseEvent('pointerdown'));
            document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 30 }));
            document.dispatchEvent(new MouseEvent('pointerup'));

            expect(getResizableElement(fixture).style.width).toBe('');

            fixture.componentInstance.disableSizeUpdate.set(false);
            fixture.detectChanges();

            getResizerElement(fixture).dispatchEvent(new MouseEvent('pointerdown'));
            document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 30 }));

            expect(getResizableElement(fixture).style.width).toBe(`${CONTENT_BOX.width + 30}px`);
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
