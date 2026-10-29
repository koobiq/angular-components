import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqLocalDropzone } from '@koobiq/components/file-upload';

@Component({
    selector: 'test-app',
    imports: [KbqLocalDropzone],
    template: `
        <div kbqLocalDropzone [disabled]="disabled">Drop zone</div>
    `
})
class TestApp {
    readonly dropzone = viewChild.required(KbqLocalDropzone);
    disabled = true;
}

const dragEvent = (type: string): DragEvent =>
    new DragEvent(type, { bubbles: true, cancelable: true, relatedTarget: null, dataTransfer: new DataTransfer() });

describe('triage: kbqLocalDropzone ignores disabled on drag enter', () => {
    let fixture: ComponentFixture<TestApp>;
    let host: HTMLElement;

    const getPane = (): HTMLElement | null =>
        TestBed.inject(OverlayContainer).getContainerElement().querySelector('.kbq-local-dropzone');

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
        host = fixture.nativeElement.querySelector('[kbqLocalDropzone]');
    });

    it('DEFECT: a disabled local dropzone opens its overlay, which then neither closes on leave nor takes the drop', async () => {
        expect(fixture.componentInstance.dropzone().disabled()).toBe(true);

        host.dispatchEvent(dragEvent('dragenter'));
        // Lets the timer that fades the overlay in run before the overlay is inspected.
        await new Promise<void>((resolve) => setTimeout(resolve));

        const pane = getPane();

        expect(pane).not.toBeNull();

        pane!.dispatchEvent(dragEvent('dragleave'));

        expect(getPane()).not.toBeNull();

        const dragover = dragEvent('dragover');

        pane!.dispatchEvent(dragover);

        expect(dragover.defaultPrevented).toBe(false);

        const drop = dragEvent('drop');

        pane!.dispatchEvent(drop);

        expect(drop.defaultPrevented).toBe(false);
        expect(getPane()).not.toBeNull();
    });

    it('control: once enabled, the same overlay closes on leave', async () => {
        fixture.componentInstance.disabled = false;
        fixture.detectChanges();

        host.dispatchEvent(dragEvent('dragenter'));
        await new Promise<void>((resolve) => setTimeout(resolve));

        const pane = getPane();

        expect(pane).not.toBeNull();

        pane!.dispatchEvent(dragEvent('dragleave'));

        expect(getPane()).toBeNull();
    });
});
