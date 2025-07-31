import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, NgModule } from '@angular/core';
import { TestBed, fakeAsync, flush, inject, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownItem, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalModule } from './modal.module';
import { KbqModalService } from './modal.service';
import { ModalSize } from './modal.type';

describe('KbqModal', () => {
    let overlayContainer: OverlayContainer;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ModalTestModule]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
        overlayContainer = oc;
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('created by service', () => {
        it('should set focus inside modal when opened by dropdown', fakeAsync(() => {
            const fixtureComponent = TestBed.createComponent(ModalByServiceFromDropdownComponent);
            const buttonElement = fixtureComponent.debugElement.nativeElement.querySelector('button');

            fixtureComponent.detectChanges();

            expect(document.activeElement).not.toBe(buttonElement);

            buttonElement.click();
            fixtureComponent.detectChanges();
            tick();

            const dropdownItems = fixtureComponent.debugElement
                .queryAll(By.directive(KbqDropdownItem))
                .map((debugElement) => debugElement.nativeElement as HTMLButtonElement);

            dropdownItems[0].click();
            fixtureComponent.detectChanges();
            tick();

            const activeElement: HTMLButtonElement | null = document.activeElement as HTMLButtonElement;

            expect(activeElement).not.toBe(buttonElement);
            expect(activeElement).not.toBe(dropdownItems[0]);
            expect(activeElement).toBeTruthy();

            if (activeElement) {
                expect(activeElement.innerText).toEqual(fixtureComponent.componentInstance.kbqOkText);
            }

            flush();
        }));
    });
});

@Component({
    selector: 'kbq-modal-by-service-from-dropdown',
    template: `
        <kbq-modal kbqWrapClassName="__NON_SERVICE_ID_SUFFIX__" [(kbqVisible)]="nonServiceModalVisible" />
        <button class="template-button" kbq-button [kbqDropdownTriggerFor]="dropdown">Open modal from dropdown</button>
        <kbq-dropdown #dropdown>
            <ng-template kbqDropdownContent>
                <button kbq-dropdown-item (click)="showConfirm()">open Component Modal</button>
            </ng-template>
        </kbq-dropdown>
    `,
    // Testing for service with parent service
    providers: [KbqModalControlService]
})
class ModalByServiceFromDropdownComponent {
    nonServiceModalVisible = false;
    kbqOkText = 'Save';

    constructor(
        public modalControlService: KbqModalControlService,
        public modalService: KbqModalService
    ) {}

    showConfirm() {
        this.modalService.success({
            kbqSize: ModalSize.Small,
            kbqRestoreFocus: false,
            kbqMaskClosable: true,
            kbqContent: 'Save all?',
            kbqOkText: this.kbqOkText,
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('OK')
        });
    }
}

const TEST_DIRECTIVES = [
    ModalByServiceFromDropdownComponent
];

@NgModule({
    imports: [
        KbqModalModule,
        KbqButtonModule,
        KbqDropdownModule,
        NoopAnimationsModule
    ],
    exports: TEST_DIRECTIVES,
    declarations: TEST_DIRECTIVES
})
class ModalTestModule {}
