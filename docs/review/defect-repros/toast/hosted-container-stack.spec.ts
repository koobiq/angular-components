import { ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, dispatchMouseEvent } from '@koobiq/components/core';
import {
    KbqToastComponent,
    KbqToastContainerComponent,
    KbqToastData,
    KbqToastModule,
    KbqToastService
} from '@koobiq/components/toast';

@Component({
    selector: 'hosted-container',
    imports: [KbqToastModule],
    template: `
        <kbq-toast-container />
    `
})
class HostedContainer {
    readonly container = viewChild.required(KbqToastContainerComponent);
}

describe('triage: toast created in a kbq-toast-container hosted by a consumer', () => {
    let service: KbqToastService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqToastModule, HostedContainer] });

        service = TestBed.inject(KbqToastService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        service.ngOnDestroy();
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: the close button and Escape report the toast as read to the root service but leave it on screen', () => {
        const fixture = TestBed.createComponent(HostedContainer);

        fixture.detectChanges();

        const read: KbqToastData[] = [];
        const subscription = service.read.subscribe((data) => data && read.push(data));
        const data: KbqToastData = { title: 'Hosted', closeButton: true };
        const ref = fixture.componentInstance.container().createToast(data, KbqToastComponent, false);

        fixture.detectChanges();

        const host = ref.location.nativeElement as HTMLElement;

        host.querySelector<HTMLButtonElement>('[kbq-toast-close-button]')!.click();
        fixture.detectChanges();

        expect(read).toEqual([data]);
        expect(ref.hostView.destroyed).toBe(false);
        expect(fixture.nativeElement.querySelectorAll('kbq-toast').length).toBe(1);

        dispatchKeyboardEvent(host, 'keydown', ESCAPE, undefined, 'Escape');
        fixture.detectChanges();

        expect(ref.hostView.destroyed).toBe(false);
        expect(fixture.nativeElement.querySelectorAll('kbq-toast').length).toBe(1);

        subscription.unsubscribe();
    });

    it('DEFECT: hovering a toast in a hosted container pauses the root service stack', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(HostedContainer);

        fixture.detectChanges();

        const hosted = fixture.componentInstance.container().createToast({ title: 'Hosted' }, KbqToastComponent, false);

        fixture.detectChanges();

        service.show({ title: 'Root' }, 1000);
        TestBed.inject(ApplicationRef).tick();

        dispatchMouseEvent(hosted.location.nativeElement, 'mouseenter');

        expect(service.hovered()).toBe(true);

        await vi.advanceTimersByTimeAsync(10000);

        // The root toast, 1000 ms long, outlives ten times its duration.
        expect(service.toasts.length).toBe(1);

        service.ngOnDestroy();
        await vi.runOnlyPendingTimersAsync();
    });
});
