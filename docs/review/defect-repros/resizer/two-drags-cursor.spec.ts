import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqResizable, KbqResizer } from '@koobiq/components/resizer';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
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

@Component({
    selector: 'test-resizers',
    imports: [KbqResizable, KbqResizer],
    template: `
        <div kbqResizable>
            <div class="width-handle" [kbqResizer]="[1, 0]"></div>
            <div class="height-handle" [kbqResizer]="[0, 1]"></div>
        </div>
    `
})
class TestResizers {}

describe('KbqResizer triage: two simultaneous drags', () => {
    afterEach(() => document.body.style.removeProperty('cursor'));

    it('DEFECT: when the first of two overlapping drags ends first, the second one leaves the first handle cursor on the body', async () => {
        const fixture = createComponent(TestResizers);

        await fixture.whenStable();

        const widthHandle: HTMLElement = fixture.debugElement.query(By.css('.width-handle')).nativeElement;
        const heightHandle: HTMLElement = fixture.debugElement.query(By.css('.height-handle')).nativeElement;

        expect(document.body.style.cursor).toBe('');

        // Mouse (primary of its type) on the width handle.
        widthHandle.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 1 }));
        await fixture.whenStable();

        expect(document.body.style.cursor).toBe('ew-resize');

        // Pen (primary of its own type) on the height handle while the mouse drag is still active.
        heightHandle.dispatchEvent(createPointerEvent('pointerdown', { pointerId: 2 }));
        await fixture.whenStable();

        expect(document.body.style.cursor).toBe('ns-resize');

        document.dispatchEvent(createPointerEvent('pointerup', { pointerId: 1 }));
        await fixture.whenStable();
        document.dispatchEvent(createPointerEvent('pointerup', { pointerId: 2 }));
        await fixture.whenStable();

        // Both drags are over, yet the body keeps the width handle's resize cursor, still `!important`.
        expect(document.body.style.cursor).toBe('ew-resize');
        expect(document.body.style.getPropertyPriority('cursor')).toBe('important');
    });
});
