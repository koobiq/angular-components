/* tslint:disable:no-magic-numbers */
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed, inject, tick, waitForAsync, fakeAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { KbqToastModule } from './toast.module';
import { KbqToastService } from './toast.service';
import { KbqToastData } from './toast.type';


const MOCK_TOAST_DATA: KbqToastData = { style: 'warning', title: 'Warning', content: 'Message Content', closeButton: true };

describe('ToastService', () => {
    let toastService: KbqToastService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let fixture;
    let testComponent;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, BrowserAnimationsModule],
            declarations: [KbqToastButtonWrapperComponent]
        })
        .compileComponents();
    }));

    beforeEach(inject(
        [KbqToastService, OverlayContainer],
        (ts: KbqToastService, oc: OverlayContainer) => {
            toastService = ts;
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }
    ));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('should bring no break change', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(KbqToastButtonWrapperComponent);
            testComponent = fixture.componentInstance;
        });

        afterEach(fakeAsync(() => { // wait all openModals to be closed to clean up the ModalManager as it is globally static
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

            const toastIcon = toast.ref.location.nativeElement.querySelector('.kbq-toast__icon');

            expect(toastIcon).toHaveClass('mc-error_16');
        });

        it('should create one sticky warning toast with custom icon', () => {
            const toast = toastService.show({ style: 'error', title: 'Error', icon: true, iconClass: 'mc-custom' }, 0);
            fixture.detectChanges();

            const toastIcon = toast.ref.location.nativeElement.querySelector('.kbq-toast__icon');

            expect(toastIcon).toHaveClass('mc-custom');
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

        // todo excluded because timer does not work, need use scheduler
        xit('should disappear after 3 seconds', fakeAsync(() => {
            toastService.show(MOCK_TOAST_DATA,  3000);
            fixture.detectChanges();
            tick(3100);
            fixture.detectChanges();
            expect(toastService.toasts.length).toBe(0);
        }));

        it('should delete one toast by click', fakeAsync(() => {
            spyOn(toastService, 'hide');
            const toast = toastService.show(MOCK_TOAST_DATA, 0);

            fixture.detectChanges();
            tick(600);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);

            const button = toast.ref.location.nativeElement
                .querySelector('[kbq-toast-close-button]') as HTMLButtonElement;
            button.click();

            fixture.detectChanges();
            tick(600);

            // метод вызывается, тост должен скрываться
            expect(toastService.hide).toHaveBeenCalled();

            // тут тест не проходит, toastService.toasts.indexOf(toast.ref) === 0 и длинна kbq-toast === 1
            // expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(0);
        }));

        it('should create one toast directly through service', fakeAsync(() => {
            spyOn(toastService, 'show');
            toastService.show(MOCK_TOAST_DATA,  600);

            fixture.detectChanges();
            tick(600);
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(0);
            expect(toastService.show).toHaveBeenCalledTimes(1);
        }));

        it('should create one toast by click', fakeAsync(() => {
            spyOn(testComponent, 'show').and.callThrough();
            const btn = fixture.nativeElement.querySelector('button');

            fixture.detectChanges();
            expect(testComponent.show).not.toHaveBeenCalled();

            btn.click();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);
            expect(testComponent.show).toHaveBeenCalled();
            expect(testComponent.show).toHaveBeenCalledTimes(1);
        }));
    });

});

@Component({
    selector: 'kbq-toast-test-button',
    template: `<button (click)="show()">Show</button>`
})
class KbqToastButtonWrapperComponent {
    constructor(public toastService: KbqToastService) {}

    show(): void {
        this.toastService.show({ style: 'warning', title: 'Warning', content: 'Message Content' }, 0);
    }
}
