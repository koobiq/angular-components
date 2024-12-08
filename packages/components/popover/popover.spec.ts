import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ENTER, ESCAPE, SPACE } from '@koobiq/cdk/keycodes';
import { dispatchFakeEvent, dispatchKeyboardEvent, dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KBQ_POPOVER_CONFIRM_BUTTON_TEXT, KBQ_POPOVER_CONFIRM_TEXT } from './popover-confirm.component';
import { KbqPopoverModule } from './popover.module';

describe('KbqPopover', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let componentFixture;
    let component;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqPopoverModule, NoopAnimationsModule],
            declarations: [
                KbqPopoverTestComponent,
                KbqPopoverConfirmTestComponent,
                KbqPopoverConfirmWithProvidersTestComponent
            ]
        }).compileComponents();
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        componentFixture.destroy();
    });

    describe('Check test cases', () => {
        beforeEach(() => {
            componentFixture = TestBed.createComponent(KbqPopoverTestComponent);
            component = componentFixture.componentInstance;
            componentFixture.detectChanges();
        });

        it('kbqTrigger = hover', fakeAsync(() => {
            const expectedValue = '_TEST1';
            const triggerElement = component.test1.nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            componentFixture.detectChanges();
            dispatchMouseEvent(overlayContainerElement, 'mouseenter');
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(expectedValue);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayContainerElement, 'mouseleave');
            tick(100);
            componentFixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
            expect(triggerElement.classList).not.toContain('kbq-active');
        }));

        it('kbqTrigger = manual', fakeAsync(() => {
            const expectedValue = '_TEST2';
            const triggerElement = component.test1.nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            component.popoverVisibility = true;
            tick();
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            component.popoverVisibility = false;
            componentFixture.detectChanges();
            tick(500); // wait for next tick to hide
            componentFixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
            expect(triggerElement.classList).not.toContain('kbq-active');
        }));

        it('kbqTrigger = focus', fakeAsync(() => {
            const featureKey = '_TEST3';
            const triggerElement = component.test3.nativeElement;
            dispatchFakeEvent(triggerElement, 'focus');
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            dispatchFakeEvent(triggerElement, 'blur');
            tick(100);
            componentFixture.detectChanges();
            tick(); // wait for next tick to hide
            componentFixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            expect(triggerElement.classList).not.toContain('kbq-active');
        }));

        it('Can set kbqPopoverHeader', fakeAsync(() => {
            const expectedValue = '_TEST4';
            const triggerElement = component.test4.nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();

            const header = componentFixture.debugElement.query(By.css('.kbq-popover__header'));
            expect(header.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set kbqPopoverContent', fakeAsync(() => {
            const expectedValue = '_TEST5';
            const triggerElement = component.test5.nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();

            const content = componentFixture.debugElement.query(By.css('.kbq-popover__content'));
            expect(content.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set kbqPopoverFooter', fakeAsync(() => {
            const expectedValue = '_TEST6';
            const triggerElement = component.test6.nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();

            const footer = componentFixture.debugElement.query(By.css('.kbq-popover__footer'));
            expect(footer.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set kbqPopoverClass', fakeAsync(() => {
            const expectedValue = '_TEST7';
            const triggerElement = component.test7.nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            componentFixture.detectChanges();

            const popover = componentFixture.debugElement.query(By.css('.kbq-popover'));
            expect(popover.nativeElement.classList.contains(expectedValue)).toBeTruthy();
            expect(triggerElement.classList).toContain('kbq-active');
        }));

        it('should open popover with keyboard when kbqTrigger = default', fakeAsync(() => {
            const triggerElement = component.test7.nativeElement;

            [ENTER, SPACE].forEach((keyCode) => {
                dispatchKeyboardEvent(triggerElement, 'keydown', keyCode);
                tick();
                componentFixture.detectChanges();

                let popover = componentFixture.debugElement.query(By.css('.kbq-popover'));
                expect(popover).toBeTruthy();
                expect(triggerElement.classList).toContain('kbq-active');

                dispatchKeyboardEvent(triggerElement, 'keydown', ESCAPE);
                tick();
                componentFixture.detectChanges();
                popover = componentFixture.debugElement.query(By.css('.kbq-popover'));
                expect(popover).not.toBeTruthy();
                expect(triggerElement.classList).not.toContain('kbq-active');
            });
        }));

        it('should open popover with keyboard when kbqTrigger = default for elements other than button', fakeAsync(() => {
            const triggerElement = component.test8.nativeElement;

            [ENTER, SPACE].forEach((keyCode) => {
                dispatchKeyboardEvent(triggerElement, 'keydown', keyCode);
                tick();
                componentFixture.detectChanges();

                let popover = componentFixture.debugElement.query(By.css('.kbq-popover'));
                expect(popover).toBeTruthy();
                expect(triggerElement.classList).toContain('kbq-active');

                dispatchKeyboardEvent(triggerElement, 'keydown', ESCAPE);
                tick();
                componentFixture.detectChanges();
                popover = componentFixture.debugElement.query(By.css('.kbq-popover'));
                expect(popover).not.toBeTruthy();
                expect(triggerElement.classList).not.toContain('kbq-active');
            });
        }));
    });

    describe('Check popover confirm', () => {
        beforeEach(() => {
            componentFixture = TestBed.createComponent(KbqPopoverConfirmTestComponent);
            component = componentFixture.componentInstance;
            componentFixture.detectChanges();
        });

        it('Default text is correct', fakeAsync(() => {
            const triggerElement = component.test8.nativeElement;
            dispatchMouseEvent(triggerElement, 'click');
            tick();
            componentFixture.detectChanges();

            const button = componentFixture.debugElement.query(By.css('.kbq-popover-confirm button'));
            expect(button.nativeElement.textContent.trim()).toEqual('Да');

            const confirmText = componentFixture.debugElement.query(
                By.css('.kbq-popover-confirm .kbq-popover__content div')
            );
            expect(confirmText.nativeElement.textContent).toEqual('Вы уверены, что хотите продолжить?');
        }));

        it('Can set confirm text through input', fakeAsync(() => {
            const expectedValue = 'new confirm text';

            const triggerElement = component.test9.nativeElement;
            dispatchMouseEvent(triggerElement, 'click');
            tick();
            componentFixture.detectChanges();

            const confirmText = componentFixture.debugElement.query(
                By.css('.kbq-popover-confirm .kbq-popover__content div')
            );
            expect(confirmText.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set button text through input', fakeAsync(() => {
            const expectedValue = 'new button text';

            const triggerElement = component.test10.nativeElement;
            dispatchMouseEvent(triggerElement, 'click');
            tick();
            componentFixture.detectChanges();

            const button = componentFixture.debugElement.query(By.css('.kbq-popover-confirm button'));
            expect(button.nativeElement.textContent.trim()).toEqual(expectedValue);
        }));

        it('Click emits confirm', fakeAsync(() => {
            const onConfirmSpyFn = jest.spyOn(component, 'onConfirm');

            const triggerElement = component.test11.nativeElement;
            dispatchMouseEvent(triggerElement, 'click');
            tick();

            const confirmButton = componentFixture.debugElement.query(By.css('.kbq-popover-confirm button'));
            dispatchMouseEvent(confirmButton.nativeElement, 'click');
            tick();
            componentFixture.detectChanges();

            expect(onConfirmSpyFn).toHaveBeenCalled();
        }));
    });

    describe('Check popover confirm with providers', () => {
        beforeEach(() => {
            componentFixture = TestBed.createComponent(KbqPopoverConfirmWithProvidersTestComponent);
            component = componentFixture.componentInstance;
            componentFixture.detectChanges();
        });

        it('Provided text is correct', fakeAsync(() => {
            const triggerElement = component.test12.nativeElement;
            dispatchMouseEvent(triggerElement, 'click');
            tick();
            componentFixture.detectChanges();

            const button = componentFixture.debugElement.query(By.css('.kbq-popover-confirm button'));
            expect(button.nativeElement.textContent.trim()).toEqual('provided button text');

            const confirmText = componentFixture.debugElement.query(
                By.css('.kbq-popover-confirm .kbq-popover__content div')
            );
            expect(confirmText.nativeElement.textContent).toEqual('provided confirm text');
        }));
    });
});

@Component({
    selector: 'kbq-popover-test-component',
    template: `
        <button #test1 [kbqTrigger]="'hover'" [kbqPopoverContent]="'_TEST1'" kbqPopover>_TEST1asdasd</button>
        <button
            #test2
            [kbqTrigger]="'manual'"
            [kbqPopoverVisible]="popoverVisibility"
            kbqPopover
            kbqPopoverContent="_TEST2"
        >
            _TEST2
        </button>
        <button #test3 [kbqTrigger]="'focus'" [kbqPopoverContent]="'_TEST3'" kbqPopover>_TEST3</button>

        <button #test4 [kbqTrigger]="'hover'" [kbqPopoverHeader]="'_TEST4'" kbqPopover>_TEST4</button>
        <button #test5 [kbqTrigger]="'hover'" [kbqPopoverContent]="'_TEST5'" kbqPopover>_TEST5</button>
        <button #test6 [kbqTrigger]="'hover'" [kbqPopoverFooter]="'_TEST6'" kbqPopover>_TEST6</button>

        <button #test7 [kbqPopoverClass]="'_TEST7'" [kbqPopoverContent]="'_TEST7'" kbqPopover>_TEST7</button>
        <button #test8 [kbqPopoverClass]="'_TEST8'" [kbqPopoverContent]="'_TEST8'" kbqPopover>_TEST8</button>
    `
})
class KbqPopoverTestComponent {
    popoverVisibility: boolean = false;

    @ViewChild('test1', { static: false }) test1: ElementRef;
    @ViewChild('test2', { static: false }) test2: ElementRef;
    @ViewChild('test3', { static: false }) test3: ElementRef;
    @ViewChild('test4', { static: false }) test4: ElementRef;
    @ViewChild('test5', { static: false }) test5: ElementRef;
    @ViewChild('test6', { static: false }) test6: ElementRef;
    @ViewChild('test7', { static: false }) test7: ElementRef;
    @ViewChild('test7', { static: false }) test8: ElementRef;
}

@Component({
    selector: 'kbq-popover-test-component',
    template: `
        <button #test8 kbqPopoverConfirm>_TEST8</button>
        <button #test9 kbqPopoverConfirm kbqPopoverConfirmText="new confirm text">_TEST9</button>
        <button #test10 kbqPopoverConfirm kbqPopoverConfirmButtonText="new button text">_TEST10</button>
        <button #test11 (confirm)="onConfirm()" kbqPopoverConfirm>_TEST11</button>
    `
})
class KbqPopoverConfirmTestComponent {
    @ViewChild('test8', { static: false }) test8: ElementRef;
    @ViewChild('test9', { static: false }) test9: ElementRef;
    @ViewChild('test10', { static: false }) test10: ElementRef;
    @ViewChild('test11', { static: false }) test11: ElementRef;

    onConfirm() {
        return;
    }
}

@Component({
    selector: 'kbq-popover-test-with-providers-component',
    template: `
        <button #test12 kbqPopoverConfirm>_TEST12</button>
    `,
    providers: [
        { provide: KBQ_POPOVER_CONFIRM_TEXT, useValue: 'provided confirm text' },
        { provide: KBQ_POPOVER_CONFIRM_BUTTON_TEXT, useValue: 'provided button text' }
    ]
})
class KbqPopoverConfirmWithProvidersTestComponent {
    @ViewChild('test12', { static: false }) test12: ElementRef;
}
