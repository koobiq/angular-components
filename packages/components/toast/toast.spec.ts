import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, NgZone } from '@angular/core';
import { TestBed, discardPeriodicTasks, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KbqToastModule } from './toast.module';
import { KbqToastService } from './toast.service';
import { KbqToastData } from './toast.type';

const MOCK_TOAST_DATA: KbqToastData = {
    style: 'warning',
    title: 'Warning',
    content: 'Message Content',
    closeButton: true
};

describe('ToastService', () => {
    let toastService: KbqToastService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let fixture;
    let testComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqToastModule,
                NoopAnimationsModule,
                KbqToastButtonWrapperComponent
            ]
        }).compileComponents();
    });

    beforeEach(inject([KbqToastService, OverlayContainer], (ts: KbqToastService, oc: OverlayContainer) => {
        toastService = ts;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('should bring no break change', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(KbqToastButtonWrapperComponent);
            testComponent = fixture.componentInstance;
        });

        afterEach(fakeAsync(() => {
            // wait all openModals to be closed to clean up the ModalManager as it is globally static
            overlayContainer.ngOnDestroy();
            fixture.detectChanges();
            tick(1000);
        }));

        it('should create one sticky toast', () => {
            toastService.show({ style: 'success', title: 'Success', content: 'Message Content' }, 0);
            expect(toastService.toasts.length).toBe(1);
        });

        it('should create one sticky warning toast', () => {
            toastService.show(MOCK_TOAST_DATA, 0);
            expect(toastService.toasts[0].instance.data.style).toBe('warning');
        });

        it('should create one sticky warning toast with default icon', () => {
            const toast = toastService.show({ style: 'warning', title: 'Warning', icon: true }, 0);

            fixture.detectChanges();

            const toastIcon: HTMLElement = toast.ref.location.nativeElement.querySelector('.kbq-toast__icon');

            expect(toastIcon.classList).toContain('kbq-triangle-exclamation_16');
        });

        it('should create one sticky warning toast with custom icon', () => {
            const toast = toastService.show({ style: 'error', title: 'Error', icon: true, iconClass: 'kbq-custom' }, 0);

            fixture.detectChanges();

            const toastIcon: HTMLElement = toast.ref.location.nativeElement.querySelector('.kbq-toast__icon');

            expect(toastIcon.classList).toContain('kbq-custom');
        });

        it('should container only title', () => {
            toastService.show({ style: 'success', title: 'Success' }, 0);
            expect(toastService.toasts[0].instance.data.title).toBe('Success');
            expect(toastService.toasts[0].instance.data.content).toBe(undefined);
        });

        it('should delete toast', () => {
            toastService.show(MOCK_TOAST_DATA, 0);
            const openToast = toastService.toasts[0].instance;

            expect(toastService.toasts.length).toBe(1);
            fixture.detectChanges();

            toastService.hide(openToast.id);
            fixture.detectChanges();
            expect(toastService.toasts.length).toBe(0);
        });

        it('should delete one toast by click', fakeAsync(() => {
            const hideSpyFn = jest.spyOn(toastService, 'hide');
            const toast = toastService.show(MOCK_TOAST_DATA, 0);

            fixture.detectChanges();
            tick(600);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);

            const button = toast.ref.location.nativeElement.querySelector(
                '[kbq-toast-close-button]'
            ) as HTMLButtonElement;

            button.click();

            fixture.detectChanges();
            tick(600);

            expect(hideSpyFn).toHaveBeenCalledTimes(1);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(0);
        }));

        it('should create one toast directly through service', fakeAsync(() => {
            const showSpyFn = jest.spyOn(toastService, 'show');

            toastService.show(MOCK_TOAST_DATA, 600);

            fixture.detectChanges();
            tick(600);
            fixture.detectChanges();

            expect(showSpyFn).toHaveBeenCalledTimes(1);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);
        }));

        it('should create one toast by click', fakeAsync(() => {
            const showSpyFn = jest.spyOn(testComponent, 'show');
            const btn = fixture.nativeElement.querySelector('button');

            fixture.detectChanges();
            expect(showSpyFn).not.toHaveBeenCalled();

            btn.click();
            fixture.detectChanges();

            expect(showSpyFn).toHaveBeenCalledTimes(1);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);
        }));
    });
});

describe('Standalone ToastService', () => {
    let service: KbqToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule, KbqToastButtonWrapperComponent]
        }).compileComponents();
    });

    it('should disappear after 3 seconds', fakeAsync(() => {
        const destroy$ = new Subject<void>();

        service = TestBed.inject(KbqToastService);
        service.timer = service.timer.pipe(takeUntil(destroy$));

        service.show(MOCK_TOAST_DATA, 3000);
        expect(service.toasts.length).toEqual(1);
        tick(3100);
        destroy$.next();
        tick();

        expect(service.toasts.length).toEqual(0);
        flush();
        discardPeriodicTasks();
    }));

    it('should call timer outsideAngular', fakeAsync(() => {
        const destroy$ = new Subject<void>();

        service = TestBed.inject(KbqToastService);
        service.timer.subscribe(() => expect(NgZone.isInAngularZone()).toBeFalsy());
        service.timer = service.timer.pipe(takeUntil(destroy$));

        service.show(MOCK_TOAST_DATA, 3000);
        tick(3100);
        destroy$.next();

        flush();
        discardPeriodicTasks();
    }));
});

@Component({
    selector: 'kbq-toast-test-button',
    imports: [KbqToastModule],
    template: `
        <button (click)="show()">Show</button>
    `
})
class KbqToastButtonWrapperComponent {
    constructor(public toastService: KbqToastService) {}
    show(): void {
        this.toastService.show({ style: 'warning', title: 'Warning', content: 'Message Content' }, 0);
    }
}
