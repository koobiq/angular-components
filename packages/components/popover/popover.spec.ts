import { coerceElement } from '@angular/cdk/coercion';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    OverlayContainer,
    ScrollDispatcher
} from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
    Component,
    DebugElement,
    ElementRef,
    NgZone,
    Provider,
    Type,
    inject as inject_1,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT,
    ENTER,
    ESCAPE,
    KbqHideOnScrollStrategy,
    SPACE,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent
} from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';
import { KBQ_POPOVER_CONFIRM_BUTTON_TEXT, KBQ_POPOVER_CONFIRM_TEXT } from './popover-confirm.component';
import { KBQ_POPOVER_SCROLL_STRATEGY, KbqPopoverTrigger } from './popover.component';
import { KbqPopoverModule } from './popover.module';

function openAndAssertPopover<T>(componentFixture: ComponentFixture<T>, triggerElement: ElementRef) {
    dispatchMouseEvent(coerceElement(triggerElement), 'click');
    tick();
    componentFixture.detectChanges();

    const popover = componentFixture.debugElement.query(By.css('.kbq-popover'));

    expect(popover).toBeTruthy();

    return popover;
}

describe('KbqPopover', () => {
    let fixture: ComponentFixture<KbqPopoverTestComponent>;
    let componentInstance: KbqPopoverTestComponent;
    let debugElement: DebugElement;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let testScheduler: TestScheduler;

    const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
        TestBed.configureTestingModule({
            imports: [component, NoopAnimationsModule],
            providers: [
                { provide: AsyncScheduler, useValue: testScheduler },
                ...providers
            ]
        });
        const fixture = TestBed.createComponent<T>(component);

        fixture.autoDetectChanges();

        return fixture;
    };

    describe('Check test cases', () => {
        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));
            fixture = createComponent(KbqPopoverTestComponent);
            componentInstance = fixture.componentInstance;
            debugElement = fixture.debugElement;
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }));

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('kbqTrigger = hover', fakeAsync(() => {
            const expectedValue = '_TEST1';
            const triggerElement = componentInstance.test1().nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(overlayContainerElement, 'mouseenter');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(expectedValue);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayContainerElement, 'mouseleave');
            tick(100);
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
            expect(triggerElement.classList).not.toContain('kbq-active');
        }));

        it('kbqTrigger = manual', fakeAsync(() => {
            const expectedValue = '_TEST2';
            const triggerElement = componentInstance.test1().nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            componentInstance.popoverVisibility = true;
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            componentInstance.popoverVisibility = false;
            fixture.detectChanges();
            tick(500); // wait for next tick to hide
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
            expect(triggerElement.classList).not.toContain('kbq-active');
        }));

        it('kbqTrigger = focus', fakeAsync(() => {
            const featureKey = '_TEST3';
            const triggerElement = componentInstance.test3().nativeElement;

            dispatchFakeEvent(triggerElement, 'focus');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            dispatchFakeEvent(triggerElement, 'blur');
            tick(100);
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            expect(triggerElement.classList).not.toContain('kbq-active');
        }));

        it('Can set kbqPopoverHeader', fakeAsync(() => {
            const expectedValue = '_TEST4';
            const triggerElement = componentInstance.test4().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();

            const header = debugElement.query(By.css('.kbq-popover__header'));

            expect(header.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set kbqPopoverContent', fakeAsync(() => {
            const expectedValue = '_TEST5';
            const triggerElement = componentInstance.test5().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();

            const content = debugElement.query(By.css('.kbq-popover__content'));

            expect(content.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set kbqPopoverFooter', fakeAsync(() => {
            const expectedValue = '_TEST6';
            const triggerElement = componentInstance.test6().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();

            const footer = debugElement.query(By.css('.kbq-popover__footer'));

            expect(footer.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set kbqPopoverClass', fakeAsync(() => {
            const expectedValue = '_TEST7';
            const triggerElement = componentInstance.test7().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const popover = debugElement.query(By.css('.kbq-popover'));

            expect(popover.nativeElement.classList.contains(expectedValue)).toBeTruthy();
            expect(triggerElement.classList).toContain('kbq-active');
        }));

        it('should open popover with keyboard when kbqTrigger = default', fakeAsync(() => {
            const triggerElement = componentInstance.test7().nativeElement;

            [ENTER, SPACE].forEach((keyCode) => {
                dispatchKeyboardEvent(triggerElement, 'keydown', keyCode);
                tick();
                fixture.detectChanges();

                let popover = debugElement.query(By.css('.kbq-popover'));

                expect(popover).toBeTruthy();
                expect(triggerElement.classList).toContain('kbq-active');

                dispatchKeyboardEvent(triggerElement, 'keydown', ESCAPE);
                tick();
                fixture.detectChanges();
                popover = debugElement.query(By.css('.kbq-popover'));
                expect(popover).not.toBeTruthy();
                expect(triggerElement.classList).not.toContain('kbq-active');
            });
        }));

        it('should open popover with keyboard when kbqTrigger = default for elements other than button', fakeAsync(() => {
            const triggerElement = componentInstance.test8().nativeElement;

            [ENTER, SPACE].forEach((keyCode) => {
                dispatchKeyboardEvent(triggerElement, 'keydown', keyCode);
                tick();
                fixture.detectChanges();

                let popover = debugElement.query(By.css('.kbq-popover'));

                expect(popover).toBeTruthy();
                expect(triggerElement.classList).toContain('kbq-active');

                dispatchKeyboardEvent(triggerElement, 'keydown', ESCAPE);
                tick();
                fixture.detectChanges();
                popover = debugElement.query(By.css('.kbq-popover'));
                expect(popover).not.toBeTruthy();
                expect(triggerElement.classList).not.toContain('kbq-active');
            });
        }));
    });

    describe('Check popover confirm', () => {
        it('Default text is correct', fakeAsync(() => {
            const fixture = createComponent(KbqPopoverConfirmTestComponent);
            const { componentInstance, debugElement } = fixture;
            const triggerElement = componentInstance.test8().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const button = debugElement.query(By.css('.kbq-popover-confirm button'));

            expect(button.nativeElement.textContent.trim()).toEqual('Да');

            const confirmText = debugElement.query(By.css('.kbq-popover-confirm .kbq-popover__content div'));

            expect(confirmText.nativeElement.textContent).toEqual('Вы уверены, что хотите продолжить?');
        }));

        it('Can set confirm text through input', fakeAsync(() => {
            const fixture = createComponent(KbqPopoverConfirmTestComponent);
            const { componentInstance, debugElement } = fixture;
            const expectedValue = 'new confirm text';

            const triggerElement = componentInstance.test9().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const confirmText = debugElement.query(By.css('.kbq-popover-confirm .kbq-popover__content div'));

            expect(confirmText.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set button text through input', fakeAsync(() => {
            const fixture = createComponent(KbqPopoverConfirmTestComponent);
            const { componentInstance, debugElement } = fixture;
            const expectedValue = 'new button text';

            const triggerElement = componentInstance.test10().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const button = debugElement.query(By.css('.kbq-popover-confirm button'));

            expect(button.nativeElement.textContent.trim()).toEqual(expectedValue);
        }));

        it('Click emits confirm', fakeAsync(() => {
            const fixture = createComponent(KbqPopoverConfirmTestComponent);
            const { componentInstance, debugElement } = fixture;
            const onConfirmSpyFn = jest.spyOn(componentInstance, 'onConfirm');

            const triggerElement = componentInstance.test11().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();

            const confirmButton = debugElement.query(By.css('.kbq-popover-confirm button'));

            dispatchMouseEvent(confirmButton.nativeElement, 'click');
            tick();
            fixture.detectChanges();

            expect(onConfirmSpyFn).toHaveBeenCalled();
        }));
    });

    describe('Check popover confirm with providers', () => {
        it('Provided text is correct', fakeAsync(() => {
            const fixture = createComponent(KbqPopoverConfirmWithProvidersTestComponent);
            const { componentInstance, debugElement } = fixture;
            const triggerElement = componentInstance.test12().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const button = debugElement.query(By.css('.kbq-popover-confirm button'));

            expect(button.nativeElement.textContent.trim()).toEqual('provided button text');

            const confirmText = debugElement.query(By.css('.kbq-popover-confirm .kbq-popover__content div'));

            expect(confirmText.nativeElement.textContent).toEqual('provided confirm text');
        }));
    });

    describe('Overlay offset', () => {
        it('should add offset for some positions if element is less than arrow margin', fakeAsync(() => {
            const fixture = createComponent(PopoverSimple);
            const { componentInstance } = fixture;

            const rect = ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT * 2 - 1;

            componentInstance.triggerElementRef().nativeElement.getBoundingClientRect = () => ({
                width: rect,
                height: rect
            });
            fixture.detectChanges();

            openAndAssertPopover(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .popoverTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeTruthy();
        }));

        it('should not add offset if element is large', fakeAsync(() => {
            const fixture = createComponent(PopoverSimple);
            const { componentInstance } = fixture;

            componentInstance.triggerElementRef().nativeElement.getBoundingClientRect = () => ({
                width: 100,
                height: 100
            });
            fixture.detectChanges();

            openAndAssertPopover(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .popoverTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        }));
    });

    describe('with TemplateRef', () => {
        let fixture: ComponentFixture<KbqPopoverWithTemplateRef>;
        let componentInstance: KbqPopoverWithTemplateRef;

        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));
            fixture = createComponent(KbqPopoverWithTemplateRef);
            componentInstance = fixture.componentInstance;
            debugElement = fixture.debugElement;
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }));

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('context for template', fakeAsync(() => {
            const triggerElement = componentInstance.trigger().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();

            const header = overlayContainerElement.querySelector('.kbq-popover__header')?.textContent;
            const content = overlayContainerElement.querySelector('.kbq-popover__content')?.textContent;
            const footer = overlayContainerElement.querySelector('.kbq-popover__footer')?.textContent;

            expect(header).toEqual(componentInstance.context.header);
            expect(content).toEqual(componentInstance.context.content);
            expect(footer).toEqual(componentInstance.context.footer);
        }));
    });

    describe('shouldHideOnScrollOut / hideIfNotInViewPort', () => {
        let capturedStrategy: KbqHideOnScrollStrategy | null;

        // configureTestingModule + overrideProvider ensures our strategy beats the module-level provider
        const createHideOnScrollFixture = <T>(component: Type<T>) => {
            capturedStrategy = null;
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));

            TestBed.configureTestingModule({
                imports: [component, NoopAnimationsModule],
                providers: [{ provide: AsyncScheduler, useValue: testScheduler }]
            });

            TestBed.overrideProvider(KBQ_POPOVER_SCROLL_STRATEGY, {
                useFactory: (sd: ScrollDispatcher, vr: ViewportRuler, ngZone: NgZone) => {
                    return () => {
                        capturedStrategy = new KbqHideOnScrollStrategy(sd, vr, ngZone, {});

                        return capturedStrategy!;
                    };
                },
                deps: [ScrollDispatcher, ViewportRuler, NgZone]
            });

            const fixture = TestBed.createComponent<T>(component);

            fixture.autoDetectChanges();

            return fixture;
        };

        it('hides popover when hide$ emits (default hideIfNotInViewPort=true)', fakeAsync(() => {
            const fixture = createHideOnScrollFixture(PopoverSimple);
            const trigger = fixture.componentInstance.popoverTrigger();

            openAndAssertPopover(fixture, fixture.componentInstance.triggerElementRef());
            expect(capturedStrategy).toBeTruthy();

            (capturedStrategy as any)._hideSubject.next();
            tick();
            fixture.detectChanges();

            expect(trigger.isOpen).toBe(false);
        }));

        it('does NOT hide popover when hide$ emits and [hideIfNotInViewPort]="false"', fakeAsync(() => {
            const fixture = createHideOnScrollFixture(PopoverHideOnScrollDisabled);
            const trigger = fixture.componentInstance.popoverTrigger();

            openAndAssertPopover(fixture, fixture.componentInstance.triggerElementRef());
            expect(capturedStrategy).toBeTruthy();

            (capturedStrategy as any)._hideSubject.next();
            tick();
            fixture.detectChanges();

            expect(trigger.isOpen).toBe(true);
        }));

        it('does not crash when scroll strategy is not KbqHideOnScrollStrategy', fakeAsync(() => {
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));

            const fixture = createComponent(PopoverSimple);
            const trigger = fixture.componentInstance.popoverTrigger();

            expect(() => openAndAssertPopover(fixture, fixture.componentInstance.triggerElementRef())).not.toThrow();
            expect(trigger.isOpen).toBe(true);
        }));

        it('closeOnScroll=true closes on a scroll event independently of shouldHideOnScrollOut', fakeAsync(() => {
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));

            TestBed.configureTestingModule({
                imports: [PopoverCloseOnScrollHideDisabled, NoopAnimationsModule],
                providers: [{ provide: AsyncScheduler, useValue: testScheduler }]
            });

            const scrollSubject = new Subject<CdkScrollable | void>();

            jest.spyOn(TestBed.inject(ScrollDispatcher), 'scrolled').mockReturnValue(scrollSubject.asObservable());

            const fixture = TestBed.createComponent(PopoverCloseOnScrollHideDisabled);

            fixture.autoDetectChanges();

            const trigger = fixture.componentInstance.popoverTrigger();

            openAndAssertPopover(fixture, fixture.componentInstance.triggerElementRef());

            scrollSubject.next();
            tick(0); // flush delay(0) in closingActionsSubscription
            fixture.detectChanges();

            expect(trigger.isOpen).toBe(false);
        }));
    });
});

@Component({
    selector: 'popover-simple',
    imports: [
        KbqPopoverModule
    ],
    template: `
        <button kbqPopover [kbqPopoverContent]="'test'">Popover Trigger</button>
    `
})
export class PopoverSimple {
    elementRef = inject_1(ElementRef);

    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);
    readonly triggerElementRef = viewChild.required(KbqPopoverTrigger, { read: ElementRef });
}

@Component({
    selector: 'kbq-popover-test-component',
    imports: [KbqPopoverModule],
    template: `
        <button #test1 kbqPopover [kbqTrigger]="'hover'" [kbqPopoverContent]="'_TEST1'">_TEST1asdasd</button>
        <button
            #test2
            kbqPopover
            kbqPopoverContent="_TEST2"
            [kbqTrigger]="'manual'"
            [kbqPopoverVisible]="popoverVisibility"
        >
            _TEST2
        </button>
        <button #test3 kbqPopover [kbqTrigger]="'focus'" [kbqPopoverContent]="'_TEST3'">_TEST3</button>

        <button #test4 kbqPopover [kbqTrigger]="'hover'" [kbqPopoverHeader]="'_TEST4'">_TEST4</button>
        <button #test5 kbqPopover [kbqTrigger]="'hover'" [kbqPopoverContent]="'_TEST5'">_TEST5</button>
        <button #test6 kbqPopover [kbqTrigger]="'hover'" [kbqPopoverFooter]="'_TEST6'">_TEST6</button>

        <button #test7 kbqPopover [kbqPopoverClass]="'_TEST7'" [kbqPopoverContent]="'_TEST7'">_TEST7</button>
        <button #test8 kbqPopover [kbqPopoverClass]="'_TEST8'" [kbqPopoverContent]="'_TEST8'">_TEST8</button>
    `
})
class KbqPopoverTestComponent {
    popoverVisibility: boolean = false;

    readonly test1 = viewChild.required<ElementRef>('test1');
    readonly test2 = viewChild.required<ElementRef>('test2');
    readonly test3 = viewChild.required<ElementRef>('test3');
    readonly test4 = viewChild.required<ElementRef>('test4');
    readonly test5 = viewChild.required<ElementRef>('test5');
    readonly test6 = viewChild.required<ElementRef>('test6');
    readonly test7 = viewChild.required<ElementRef>('test7');
    readonly test8 = viewChild.required<ElementRef>('test7');
}

@Component({
    selector: 'kbq-popover-test-component',
    imports: [KbqPopoverModule],
    template: `
        <button #test8 kbqPopoverConfirm>_TEST8</button>
        <button #test9 kbqPopoverConfirm kbqPopoverConfirmText="new confirm text">_TEST9</button>
        <button #test10 kbqPopoverConfirm kbqPopoverConfirmButtonText="new button text">_TEST10</button>
        <button #test11 kbqPopoverConfirm (confirm)="onConfirm()">_TEST11</button>
    `
})
class KbqPopoverConfirmTestComponent {
    readonly test8 = viewChild.required<ElementRef>('test8');
    readonly test9 = viewChild.required<ElementRef>('test9');
    readonly test10 = viewChild.required<ElementRef>('test10');
    readonly test11 = viewChild.required<ElementRef>('test11');

    onConfirm() {
        return;
    }
}

@Component({
    selector: 'kbq-popover-test-with-providers-component',
    imports: [KbqPopoverModule],
    template: `
        <button #test12 kbqPopoverConfirm>_TEST12</button>
    `,
    providers: [
        { provide: KBQ_POPOVER_CONFIRM_TEXT, useValue: 'provided confirm text' },
        { provide: KBQ_POPOVER_CONFIRM_BUTTON_TEXT, useValue: 'provided button text' }
    ]
})
class KbqPopoverConfirmWithProvidersTestComponent {
    readonly test12 = viewChild.required<ElementRef>('test12');
}

@Component({
    selector: 'popover-hide-on-scroll-disabled',
    imports: [KbqPopoverModule],
    template: `
        <button kbqPopover [kbqPopoverContent]="'test'" [hideIfNotInViewPort]="false">Popover Trigger</button>
    `
})
class PopoverHideOnScrollDisabled {
    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);
    readonly triggerElementRef = viewChild.required(KbqPopoverTrigger, { read: ElementRef });
}

@Component({
    selector: 'popover-close-on-scroll-hide-disabled',
    imports: [KbqPopoverModule],
    template: `
        <button kbqPopover [kbqPopoverContent]="'test'" [hideIfNotInViewPort]="false" [closeOnScroll]="true">
            Popover Trigger
        </button>
    `
})
class PopoverCloseOnScrollHideDisabled {
    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);
    readonly triggerElementRef = viewChild.required(KbqPopoverTrigger, { read: ElementRef });
}

@Component({
    selector: 'kbq-popover-wih-template-ref',
    imports: [KbqPopoverModule],
    template: `
        <ng-template #popoverHeaderTemplate let-ctx>{{ ctx.header }}</ng-template>
        <ng-template #popoverContentTemplate let-ctx>{{ ctx.content }}</ng-template>
        <ng-template #popoverFooterTemplate let-ctx>{{ ctx.footer }}</ng-template>
        <button
            #trigger
            kbqPopover
            [kbqTrigger]="'hover'"
            [kbqPopoverHeader]="popoverHeaderTemplate"
            [kbqPopoverContent]="popoverContentTemplate"
            [kbqPopoverFooter]="popoverFooterTemplate"
            [kbqPopoverContext]="context"
        >
            Button
        </button>
    `
})
class KbqPopoverWithTemplateRef {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    context = { header: 'header', content: 'content', footer: 'footer' };
}
