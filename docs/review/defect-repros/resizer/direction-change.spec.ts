import { Component, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqResizable, KbqResizer, KbqResizerDirection } from '@koobiq/components/resizer';

const CONTENT_BOX = { width: 100, height: 50 };

const windowStub: Provider = {
    provide: KBQ_WINDOW,
    useValue: {
        getComputedStyle: () => ({
            boxSizing: 'content-box',
            width: `${CONTENT_BOX.width}px`,
            height: `${CONTENT_BOX.height}px`
        })
    }
};

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers: [windowStub] });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

@Component({
    selector: 'test-resizer',
    imports: [KbqResizable, KbqResizer],
    template: `
        <div kbqResizable>
            <div [kbqResizer]="direction()" (sizeChange)="sizeChange($event)"></div>
        </div>
    `
})
class TestResizer {
    readonly direction = signal<KbqResizerDirection>([1, 0]);
    readonly sizeChange = vi.fn();
}

const setup = async () => {
    const fixture = createComponent(TestResizer);

    await fixture.whenStable();

    const resizable: HTMLElement = fixture.debugElement.query(By.directive(KbqResizable)).nativeElement;
    const resizer: HTMLElement = fixture.debugElement.query(By.directive(KbqResizer)).nativeElement;

    resizer.dispatchEvent(new MouseEvent('pointerdown', { clientX: 0, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 30 }));
    await fixture.whenStable();

    return { fixture, resizable };
};

describe('KbqResizer triage: direction change during a drag', () => {
    afterEach(() => document.body.style.removeProperty('cursor'));

    it('DEFECT: flipping the direction mid-drag applies it to the whole travel, so a 1px move makes the width jump', async () => {
        const { fixture, resizable } = await setup();

        expect(resizable.style.width).toBe('130px');

        fixture.componentInstance.direction.set([-1, 0]);
        await fixture.whenStable();

        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 31 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenLastCalledWith({ width: 69, height: 50 });
        expect(resizable.style.width).toBe('69px');

        document.dispatchEvent(new MouseEvent('pointerup'));
    });

    it('DEFECT: switching to [0, 0] mid-drag keeps the drag alive, shows the default cursor and reports the starting size', async () => {
        const { fixture, resizable } = await setup();

        fixture.componentInstance.direction.set([0, 0]);
        await fixture.whenStable();

        expect(document.body.style.cursor).toBe('default');
        expect(document.body.style.getPropertyPriority('cursor')).toBe('important');

        fixture.componentInstance.sizeChange.mockClear();
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 80 }));

        // Still dragging: the move is reported, as the starting size, while the element keeps the last written width.
        expect(fixture.componentInstance.sizeChange).toHaveBeenCalledWith(CONTENT_BOX);
        expect(resizable.style.width).toBe('130px');

        document.dispatchEvent(new MouseEvent('pointerup'));
        await fixture.whenStable();

        expect(document.body.style.cursor).toBe('');
    });
});
