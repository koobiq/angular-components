import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, inject } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_LUXON_DATE_FORMATS, KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KBQ_DATE_FORMATS } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';
import { KbqDatepickerModule } from './index';

/** Reproduces the reported scenario: a datepicker living inside a `KbqModalService`-created component. */
@Component({
    selector: 'modal-content-with-datepicker',
    imports: [FormsModule, KbqDatepickerModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <input [kbqDatepicker]="picker" [ngModel]="null" />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="picker" />
            <kbq-datepicker #picker />
        </kbq-form-field>
    `
})
class ModalContentWithDatepicker {}

@Component({
    selector: 'modal-host',
    imports: [KbqModalModule],
    template: ''
})
class ModalHost {
    readonly modalService = inject(KbqModalService);

    open() {
        return this.modalService.open({ kbqComponent: ModalContentWithDatepicker });
    }
}

describe('datepicker inside a modal', () => {
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        TestBed.configureTestingModule({
            // Only the app-level date wiring is registered here. `KbqDatepickerModule` deliberately stays a
            // standalone import of the modal content component, which is where the reported app had it.
            imports: [KbqLuxonDateModule, NoopAnimationsModule, ModalHost],
            providers: [{ provide: KBQ_DATE_FORMATS, useValue: KBQ_LUXON_DATE_FORMATS }]
        });

        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => overlayContainer.ngOnDestroy());

    it('should open the calendar', fakeAsync(() => {
        const fixture = TestBed.createComponent(ModalHost);

        fixture.detectChanges();

        expect(() => {
            fixture.componentInstance.open();
            fixture.detectChanges();
            flush();
        }).not.toThrow();

        const toggle = overlayContainer.getContainerElement().querySelector<HTMLElement>('kbq-datepicker-toggle-icon');

        expect(toggle).not.toBeNull();

        expect(() => {
            toggle!.click();
            fixture.detectChanges();
            tick(500);
            flush();
        }).not.toThrow();

        expect(overlayContainer.getContainerElement().querySelector('kbq-datepicker__content')).not.toBeNull();
    }));
});
