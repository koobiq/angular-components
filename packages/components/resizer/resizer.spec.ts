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
