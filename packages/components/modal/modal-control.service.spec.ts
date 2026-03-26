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
        ref.afterOpen.next();

        expect(service.openModals.length).toBe(1);
        expect(service.hasRegistered(ref)).toBe(true);

        ref.afterClose.next();

        expect(service.openModals.length).toBe(0);
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

    it('should emit afterAllClose when the last open modal closes', () => {
        const ref = new MockModalRef();
        const spy = jest.fn();

        service.afterAllClose.subscribe(spy);
        service.registerModal(ref);
        ref.afterOpen.next();
        ref.afterClose.next();

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
