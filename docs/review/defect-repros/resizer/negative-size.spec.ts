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

describe('KbqResizer triage: negative size', () => {
    it('DEFECT: a move that asks for a negative width leaves the element at the last written width while sizeChange reports the negative value', async () => {
        const fixture = createComponent(TestResizer);

        await fixture.whenStable();

        const resizable: HTMLElement = fixture.debugElement.query(By.directive(KbqResizable)).nativeElement;
        const resizer: HTMLElement = fixture.debugElement.query(By.directive(KbqResizer)).nativeElement;

        resizer.dispatchEvent(new MouseEvent('pointerdown', { clientX: 0, clientY: 0 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 50 }));

        expect(resizable.style.width).toBe('150px');

        // One coalesced move that travels past the element's left edge: 100 - 300 = -200.
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: -300 }));

        expect(fixture.componentInstance.sizeChange).toHaveBeenLastCalledWith({ width: -200, height: 50 });
        // `-200px` is rejected by the CSSOM, so the element stays at 150px instead of collapsing.
        expect(resizable.style.width).toBe('150px');

        document.dispatchEvent(new MouseEvent('pointerup'));
    });
});
