import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import { KbqModalComponent } from './modal.component';

class MockModalRef extends KbqModalRef {
    afterOpen = new Subject<void>();
    beforeClose = new Subject<void>();
    afterClose = new Subject<void>();

    open = jest.fn();
    close = jest.fn();
    destroy = jest.fn();
    triggerOk = jest.fn();
    triggerCancel = jest.fn();
    getContentComponent = jest.fn();
    getElement = jest.fn();
    getInstance = jest.fn().mockReturnValue({} as KbqModalComponent);
    markForCheck = jest.fn();
}

describe(KbqModalControlService.name, () => {
    let service: KbqModalControlService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [KbqModalControlService]
        });
        service = TestBed.inject(KbqModalControlService);
    });

    it('should register a modal ref', () => {
        const ref = new MockModalRef();

        expect(service.hasRegistered(ref)).toBe(false);

        service.registerModal(ref);

        expect(service.hasRegistered(ref)).toBe(true);
    });

    it('should add modal refs to openModals when afterOpen emits', () => {
        const refs = [new MockModalRef(), new MockModalRef(), new MockModalRef()];

        refs.forEach((ref) => service.registerModal(ref));
        refs.forEach((ref) => ref.afterOpen.next());

        expect(service.openModals.length).toBe(3);
        refs.forEach((ref) => expect(service.openModals).toContain(ref));
    });

    it('should unregister modal ref when afterClose emits without prior afterOpen', () => {
        const ref = new MockModalRef();

        service.registerModal(ref);

        expect(service.openModals.length).toBe(0);
        expect(service.hasRegistered(ref)).toBe(true);

        ref.afterClose.next();

        expect(service.hasRegistered(ref)).toBe(false);
    });

    it('should remove modal ref from openModals and unregister it when afterClose emits', () => {
        const ref = new MockModalRef();

        service.registerModal(ref);
        ref.afterOpen.next();

        expect(service.openModals.length).toBe(1);
        expect(service.hasRegistered(ref)).toBe(true);

        ref.afterClose.next();

        expect(service.openModals.length).toBe(0);
        expect(service.hasRegistered(ref)).toBe(false);
    });

    it('should unregister a modal ref that was never opened when it is deregistered', () => {
        const ref = new MockModalRef();

        service.registerModal(ref);

        expect(service.hasRegistered(ref)).toBe(true);

        service.deregisterModal(ref);

        expect(service.hasRegistered(ref)).toBe(false);
    });

    it('should not emit afterAllClose when a modal that never opened is deregistered', () => {
        const ref = new MockModalRef();
        const spy = jest.fn();

        service.afterAllClose.subscribe(spy);
        service.registerModal(ref);
        service.deregisterModal(ref);

        expect(spy).not.toHaveBeenCalled();
    });

    it('should emit afterAllClose when the last open modal closes', () => {
        const ref = new MockModalRef();
        const spy = jest.fn();

        service.afterAllClose.subscribe(spy);
        service.registerModal(ref);
        ref.afterOpen.next();
        ref.afterClose.next();

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should track the visible stack and its topmost modal', () => {
        const first = new MockModalRef();
        const second = new MockModalRef();

        expect(service.topVisibleModal()).toBeNull();

        service.setVisible(first, true);
        service.setVisible(second, true);

        expect(service.visibleModals()).toEqual([first, second]);
        expect(service.topVisibleModal()).toBe(second);

        service.setVisible(second, false);

        expect(service.topVisibleModal()).toBe(first);

        service.deregisterModal(first);

        expect(service.visibleModals().length).toBe(0);
        expect(service.topVisibleModal()).toBeNull();
    });
});
