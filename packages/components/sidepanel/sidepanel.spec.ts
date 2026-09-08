import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import {
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    InjectionToken,
    Injector,
    NgModule,
    TemplateRef,
    inject as injectCore,
    signal,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { ESCAPE, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqDropdownItem, KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { axe } from 'jest-axe';
import {
    KBQ_SIDEPANEL_DATA,
    KbqSidepanelModule,
    KbqSidepanelPosition,
    KbqSidepanelRef,
    KbqSidepanelService,
    KbqSidepanelSize
} from './index';

/** An axe audit walks the whole overlay and needs more than the repo-wide 2s default. */
const axeTimeout = 15000;

describe('KbqSidepanelService', () => {
    let sidepanelService: KbqSidepanelService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    let rootComponentFixture: ComponentFixture<RootComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqSidepanelModule, SidepanelTestModule]
        }).compileComponents();

        rootComponentFixture = TestBed.createComponent(RootComponent);

        rootComponentFixture.detectChanges();
    });

    beforeEach(inject([KbqSidepanelService, OverlayContainer], (ss: KbqSidepanelService, oc: OverlayContainer) => {
        sidepanelService = ss;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should open a sidepanel with a component', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.textContent).toContain('Simple Sidepanel');
        expect(sidepanelRef.instance instanceof SimpleSidepanelExample).toBe(true);
    });

    it('should open a sidepanel with a template', () => {
        const templateRefFixture = TestBed.createComponent(ComponentWithTemplateForSidepanel);

        templateRefFixture.componentInstance.localValue = 'Hello';

        const data = { value: 'World!' };

        const sidepanelRef = sidepanelService.open(templateRefFixture.componentInstance.templateRef(), { data });

        expect(overlayContainerElement.textContent).toContain('Hello World!');
        expect(templateRefFixture.componentInstance.sidepanelRef).toBe(sidepanelRef);
    });

    it('should emit when sidepanel opening animation is complete', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
        const afterOpenedCallback = jest.fn();

        sidepanelRef.afterOpened().subscribe(afterOpenedCallback);

        rootComponentFixture.detectChanges();

        expect(afterOpenedCallback).not.toHaveBeenCalled();

        flush();

        expect(afterOpenedCallback).toHaveBeenCalled();
    }));

    it('should close a sidepanel and return result', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
        const afterCloseCallback = jest.fn();

        sidepanelRef.afterClosed().subscribe(afterCloseCallback);
        sidepanelRef.close('Result');

        rootComponentFixture.detectChanges();

        flush();

        expect(afterCloseCallback).toHaveBeenCalledWith('Result');
        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).toBeNull();
    }));

    it('should close a sidepanel via the escape key', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        rootComponentFixture.detectChanges();

        flush();

        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).toBeNull();
    }));

    it('should close a sidepanel via the backdrop click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        rootComponentFixture.detectChanges();

        const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

        backdrop.click();
        flush();

        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).toBeNull();
    }));

    it('should change disableClose dynamically', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
        const closeSpy = jest.spyOn(sidepanelRef, 'close');

        sidepanelRef.config.disableClose = true;

        overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

        tick();

        expect(closeSpy).toHaveBeenCalledTimes(0);
    }));

    it('should close all opened sidepanels', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('kbq-sidepanel-container').length).toBe(3);

        sidepanelService.closeAll();
        rootComponentFixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelectorAll('kbq-sidepanel-container').length).toBe(0);
    }));

    it('should set the proper animation states', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        expect(sidepanelRef.containerInstance.animationState).toBe('visible');

        sidepanelRef.close();

        expect(sidepanelRef.containerInstance.animationState).toBe('hidden');
    });

    it('should assign a unique id to each sidepanel', () => {
        const one = sidepanelService.open(SimpleSidepanelExample);
        const two = sidepanelService.open(SimpleSidepanelExample);

        expect(one.id).toBeDefined();
        expect(two.id).toBeDefined();

        expect(one.id).not.toBe(two.id);
    });

    it('should be able to find a sidepanel by id', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, { id: 'example' });

        expect(sidepanelService.getSidepanelById('example')).toBe(sidepanelRef);
    });

    it('should throw when trying to open a sidepanel with the same id as another', () => {
        sidepanelService.open(SimpleSidepanelExample, { id: 'example' });
        expect(() => sidepanelService.open(SimpleSidepanelExample, { id: 'example' })).toThrow();
    });

    it('should set default config options', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        rootComponentFixture.detectChanges();

        expect(sidepanelRef.config.position).toBe(KbqSidepanelPosition.Right);
        expect(sidepanelRef.config.hasBackdrop).toBe(true);
        expect(sidepanelRef.config.disableClose).toBe(false);
    });

    it('should be able to pass in data', () => {
        const config = { data: { value: 'test' } };

        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, config);

        expect(sidepanelRef.instance.data.value).toBe(config.data.value);
    });

    it('should allow for the id to be overwritten', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, { id: 'example' });

        expect(sidepanelRef.id).toBe('example');
    });

    it('should be able to prevent closing via the escape key', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

        rootComponentFixture.detectChanges();
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        rootComponentFixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).not.toBeNull();
    }));

    it('should be able to prevent closing via backdrop click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

        const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

        backdrop.click();
        flush();

        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).not.toBeNull();
    }));

    it('should have a backdrop by default', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).not.toBeNull();
    });

    it('should not have a backdrop with hasBackdrop false', () => {
        sidepanelService.open(SimpleSidepanelExample, { hasBackdrop: false });

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeNull();
    });

    it('should show only the topmost backdrop when multiple sidepanels are open', fakeAsync(() => {
        const spy = jest.spyOn(sidepanelService, 'open');

        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);

        tick(1000);

        rootComponentFixture.detectChanges();

        const backdropElements = overlayContainerElement.querySelectorAll<HTMLElement>('.kbq-overlay-dark-backdrop');

        expect(backdropElements.length).toBe(spy.mock.calls.length);

        expect(Array.from(backdropElements).filter((element) => element.style.opacity === '0').length).toBe(
            backdropElements.length - 1
        );
    }));

    it('should be able to set custom overlay class', () => {
        sidepanelService.open(SimpleSidepanelExample, { overlayPanelClass: 'custom-overlay' });

        expect(overlayContainerElement.querySelector('.custom-overlay')).not.toBeNull();
    });

    it('should be able to set custom backdrop class', () => {
        sidepanelService.open(SimpleSidepanelExample, { backdropClass: 'custom-backdrop' });

        expect(overlayContainerElement.querySelector('.custom-backdrop')).not.toBeNull();
    });

    it('should add indent when open more than one sidepanel with same position', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);
    });

    it('should close sidepanel on indent click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);

        overlayContainerElement.querySelectorAll<HTMLDivElement>('.kbq-sidepanel-indent')[0]!.click();

        rootComponentFixture.detectChanges();
        tick();

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);
    }));

    it('should NOT close sidepanel on indent click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);

        overlayContainerElement.querySelectorAll<HTMLDivElement>('.kbq-sidepanel-indent')[0]!.click();

        rootComponentFixture.detectChanges();
        tick();

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);
    }));

    it('should not add indent when open more than one sidepanel with different position', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample, { position: KbqSidepanelPosition.Left });

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);
    });

    it('should be able to inject a token provided via custom injector', () => {
        const customInjector = Injector.create({
            parent: TestBed.inject(Injector),
            providers: [{ provide: CUSTOM_TOKEN, useValue: 'custom-value' }]
        });

        const sidepanelRef = sidepanelService.open(SidepanelWithCustomToken, { injector: customInjector });

        expect(sidepanelRef.instance.tokenValue).toBe('custom-value');
    });

    it('should fall back to the root injector when no custom injector is provided', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        expect(sidepanelRef.instance).toBeTruthy();
    });

    it('should not trigger form submission when close button is clicked inside a form', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SidepanelWithFormComponent);
        const submitSpy = jest.spyOn(sidepanelRef.instance, 'onSubmit');

        rootComponentFixture.detectChanges();
        flush();

        const closeButton = overlayContainerElement.querySelector<HTMLButtonElement>('button[kbq-sidepanel-close]')!;

        closeButton.click();
        rootComponentFixture.detectChanges();
        flush();

        expect(submitSpy).not.toHaveBeenCalled();
    }));

    it('renders the custom scrollbar on the body', fakeAsync(() => {
        sidepanelService.open(SidepanelWithFormComponent);

        rootComponentFixture.detectChanges();
        flush();

        const body = overlayContainerElement.querySelector('.kbq-sidepanel-body')!;

        expect(body.classList).toContain('kbq-scrollbar-viewport');
        expect(body.classList).toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');
    }));

    describe('focus', () => {
        const nativeGetClientRects = Element.prototype.getClientRects;
        let triggerFixture: ComponentFixture<SidepanelTrigger>;
        let trigger: HTMLButtonElement;

        beforeEach(() => {
            // `InteractivityChecker` treats an element without geometry as invisible, and nothing in jsdom
            // has any, so the focus trap would refuse to focus anything at all.
            Element.prototype.getClientRects = () => [{}] as unknown as DOMRectList;

            triggerFixture = TestBed.createComponent(SidepanelTrigger);
            triggerFixture.detectChanges();
            trigger = triggerFixture.nativeElement.querySelector('button');
            trigger.focus();
        });

        afterEach(() => {
            Element.prototype.getClientRects = nativeGetClientRects;
        });

        it('should set focus inside the sidepanel when opened by dropdown', fakeAsync(() => {
            const fixtureComponent = TestBed.createComponent(SidepanelFromDropdownComponent);
            const buttonElement = fixtureComponent.debugElement.nativeElement.querySelector('button');

            fixtureComponent.detectChanges();
            flush();

            fixtureComponent.componentInstance.trigger().open();
            fixtureComponent.detectChanges();
            flush();

            const dropdownItems = fixtureComponent.debugElement
                .queryAll(By.directive(KbqDropdownItem))
                .map((debugElement) => debugElement.nativeElement as HTMLButtonElement);

            dropdownItems[0].click();
            fixtureComponent.detectChanges();
            tick(1000);

            const content = overlayContainerElement.querySelector('.kbq-sidepanel-content')!;

            expect(content.contains(document.activeElement)).toBe(true);
            expect(document.activeElement).not.toBe(buttonElement);
            expect(document.activeElement).not.toBe(dropdownItems[0]);

            flush();
        }));

        it('should move focus to the element marked cdkFocusInitial', fakeAsync(() => {
            sidepanelService.open(SidepanelWithFocusInitial);
            rootComponentFixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(overlayContainerElement.querySelector('[cdkFocusInitial]'));
        }));

        it('should return focus to the trigger when the sidepanel closes', fakeAsync(() => {
            const sidepanelRef = sidepanelService.open(SidepanelWithFocusInitial);

            rootComponentFixture.detectChanges();
            flush();

            expect(document.activeElement).not.toBe(trigger);

            sidepanelRef.close();
            rootComponentFixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(trigger);
        }));

        it('should return focus to the trigger of a non-modal sidepanel too', fakeAsync(() => {
            const sidepanelRef = sidepanelService.open(SidepanelWithFocusInitial, { hasBackdrop: false });

            rootComponentFixture.detectChanges();
            flush();

            expect(document.activeElement).not.toBe(trigger);

            sidepanelRef.close();
            rootComponentFixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(trigger);
        }));

        it('should leave focus on the trigger with trapFocusAutoCapture disabled', fakeAsync(() => {
            sidepanelService.open(SidepanelWithFocusInitial, { trapFocusAutoCapture: false });

            rootComponentFixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(trigger);
        }));
    });

    describe('accessibility', () => {
        const pageElements = () =>
            Array.from(document.body.children).filter(
                (element) => element !== overlayContainerElement && element.nodeName !== 'STYLE'
            );

        it('should expose the container as a dialog named by the header', fakeAsync(() => {
            sidepanelService.open(ComponentForSidepanel);
            rootComponentFixture.detectChanges();
            flush();

            const container = overlayContainerElement.querySelector('kbq-sidepanel-container')!;

            expect(container.getAttribute('role')).toBe('dialog');
            expect(container.getAttribute('aria-modal')).toBe('true');

            const labelledBy = container.getAttribute('aria-labelledby')!;

            expect(labelledBy).toBeTruthy();
            expect(document.getElementById(labelledBy)!.textContent).toContain('Sidepanel Component Content');
        }));

        it('should not claim modality for a non-modal sidepanel', fakeAsync(() => {
            sidepanelService.open(ComponentForSidepanel, { hasBackdrop: false });
            rootComponentFixture.detectChanges();
            flush();

            const container = overlayContainerElement.querySelector('kbq-sidepanel-container')!;

            expect(container.getAttribute('role')).toBe('dialog');
            expect(container.hasAttribute('aria-modal')).toBe(false);
        }));

        it('should name the sidepanel from the config when nothing else does', fakeAsync(() => {
            sidepanelService.open(SimpleSidepanelExample, { ariaLabel: 'Details' });
            rootComponentFixture.detectChanges();
            flush();

            const container = overlayContainerElement.querySelector('kbq-sidepanel-container')!;

            expect(container.getAttribute('aria-label')).toBe('Details');
            expect(container.hasAttribute('aria-labelledby')).toBe(false);
        }));

        it('should prefer an explicit ariaLabelledBy over the header title', fakeAsync(() => {
            sidepanelService.open(ComponentForSidepanel, { ariaLabelledBy: 'outer-heading' });
            rootComponentFixture.detectChanges();
            flush();

            expect(
                overlayContainerElement.querySelector('kbq-sidepanel-container')!.getAttribute('aria-labelledby')
            ).toBe('outer-heading');
        }));

        it('should name the sidepanel from a header rendered after it opened', fakeAsync(() => {
            const sidepanelRef = sidepanelService.open(SidepanelWithLateHeader);

            rootComponentFixture.detectChanges();
            flush();

            const container = overlayContainerElement.querySelector('kbq-sidepanel-container')!;

            expect(container.hasAttribute('aria-labelledby')).toBe(false);

            sidepanelRef.instance.showHeader.set(true);
            rootComponentFixture.detectChanges();
            flush();

            // The container's host bindings run before its content, so the header that appeared in the pass
            // above is named in the next one. The overlay host view hangs off the application, not off the
            // fixture, so that pass is an application tick.
            TestBed.inject(ApplicationRef).tick();

            const labelledBy = container.getAttribute('aria-labelledby')!;

            expect(labelledBy).toBeTruthy();
            expect(document.getElementById(labelledBy)!.textContent).toContain('Late title');
        }));

        it('should hide the rest of the page from assistive technology while a modal sidepanel is open', fakeAsync(() => {
            expect(pageElements().length).toBeGreaterThan(0);

            const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

            rootComponentFixture.detectChanges();
            flush();

            expect(pageElements().every((element) => element.getAttribute('aria-hidden') === 'true')).toBe(true);

            sidepanelRef.close();
            rootComponentFixture.detectChanges();
            flush();

            expect(pageElements().some((element) => element.hasAttribute('aria-hidden'))).toBe(false);
        }));

        it('should keep the page reachable while only non-modal sidepanels are open', fakeAsync(() => {
            sidepanelService.open(SimpleSidepanelExample, { hasBackdrop: false });
            rootComponentFixture.detectChanges();
            flush();

            expect(pageElements().some((element) => element.hasAttribute('aria-hidden'))).toBe(false);
        }));

        it('should keep the page hidden when a component-level service is destroyed', fakeAsync(() => {
            sidepanelService.open(SimpleSidepanelExample);
            rootComponentFixture.detectChanges();
            flush();

            const hidden = pageElements();

            expect(hidden.every((element) => element.getAttribute('aria-hidden') === 'true')).toBe(true);

            // `SidepanelFromDropdownComponent` provides its own service; destroying it must not touch the
            // bookkeeping of a sidepanel opened through the root one.
            const componentWithOwnService = TestBed.createComponent(SidepanelFromDropdownComponent);

            componentWithOwnService.detectChanges();
            componentWithOwnService.destroy();
            rootComponentFixture.detectChanges();
            flush();

            expect(hidden.every((element) => element.getAttribute('aria-hidden') === 'true')).toBe(true);
        }));

        it(
            'should have no axe violations while open',
            async () => {
                sidepanelService.open(ComponentForSidepanel);
                rootComponentFixture.detectChanges();
                await rootComponentFixture.whenStable();

                expect(await axe(overlayContainerElement)).toHaveNoViolations();
            },
            axeTimeout
        );
    });

    describe('scroll blocking', () => {
        const isBlocked = () => document.documentElement.classList.contains('cdk-global-scrollblock');

        beforeEach(() => {
            // `BlockScrollStrategy` only engages when the document actually overflows, and nothing does in jsdom.
            Object.defineProperty(document.documentElement, 'scrollHeight', { value: 10000, configurable: true });
        });

        afterEach(() => {
            delete (document.documentElement as unknown as Record<string, unknown>).scrollHeight;
            document.documentElement.classList.remove('cdk-global-scrollblock');
            // These tests leave their overlays attached, so `BlockScrollStrategy.disable()` never runs and
            // the offsets it wrote on `<html>` would follow the suite into the next test.
            document.documentElement.style.removeProperty('left');
            document.documentElement.style.removeProperty('top');
        });

        it('should block the page scroll under a modal sidepanel', () => {
            sidepanelService.open(SimpleSidepanelExample);

            expect(isBlocked()).toBe(true);
        });

        it('should leave the page scrollable under a non-modal sidepanel', () => {
            sidepanelService.open(SimpleSidepanelExample, { hasBackdrop: false });

            expect(isBlocked()).toBe(false);
        });

        it('should honour a scroll strategy given through the config', () => {
            sidepanelService.open(SimpleSidepanelExample, {
                scrollStrategy: () => TestBed.inject(Overlay).scrollStrategies.noop()
            });

            expect(isBlocked()).toBe(false);
        });

        it('should keep the page blocked while a sidepanel above the closed one stays open', fakeAsync(() => {
            const lower = sidepanelService.open(SimpleSidepanelExample);

            sidepanelService.open(SimpleSidepanelExample);

            expect(isBlocked()).toBe(true);

            lower.close();
            rootComponentFixture.detectChanges();
            flush();

            expect(isBlocked()).toBe(true);
        }));
    });

    describe('stacking', () => {
        it('should not reverse the live stack when closing all sidepanels', fakeAsync(() => {
            const first = sidepanelService.open(SimpleSidepanelExample);
            const second = sidepanelService.open(SimpleSidepanelExample);

            sidepanelService.closeAll();

            expect(sidepanelService.openedSidepanels).toEqual([first, second]);

            rootComponentFixture.detectChanges();
            flush();

            expect(sidepanelService.openedSidepanels.length).toBe(0);
        }));

        it('should drop the indent of the panel above when the one underneath closes', fakeAsync(() => {
            const lower = sidepanelService.open(SimpleSidepanelExample);

            sidepanelService.open(SimpleSidepanelExample);
            rootComponentFixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);

            lower.close();
            rootComponentFixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);
        }));

        it('should close the sidepanels opened by a component-level service when it is destroyed', fakeAsync(() => {
            const fixtureComponent = TestBed.createComponent(SidepanelFromDropdownComponent);

            fixtureComponent.detectChanges();
            fixtureComponent.componentInstance.showSidepanel();
            fixtureComponent.detectChanges();
            flush();

            expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).not.toBeNull();

            fixtureComponent.destroy();
            rootComponentFixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).toBeNull();
        }));
    });

    describe('closing', () => {
        it('should deliver the result of the first close call', fakeAsync(() => {
            const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
            const afterCloseCallback = jest.fn();

            sidepanelRef.afterClosed().subscribe(afterCloseCallback);

            sidepanelRef.close('A');
            sidepanelRef.close('B');

            rootComponentFixture.detectChanges();
            flush();

            expect(afterCloseCallback).toHaveBeenCalledTimes(1);
            expect(afterCloseCallback).toHaveBeenCalledWith('A');
        }));

        it('should prevent the default action of the escape key it consumes', fakeAsync(() => {
            sidepanelService.open(SimpleSidepanelExample);

            const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

            rootComponentFixture.detectChanges();
            flush();

            expect(event.defaultPrevented).toBe(true);
        }));

        it('should leave the escape key alone when closing is disabled', fakeAsync(() => {
            sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

            const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

            rootComponentFixture.detectChanges();
            flush();

            expect(event.defaultPrevented).toBe(false);
        }));

        it('should close the sidepanel underneath when a same-position stack is clicked through', fakeAsync(() => {
            sidepanelService.open(SimpleSidepanelExample, { hasBackdrop: false });
            sidepanelService.open(SimpleSidepanelExample, { hasBackdrop: false });
            rootComponentFixture.detectChanges();
            flush();

            overlayContainerElement.querySelector<HTMLElement>('.kbq-sidepanel-container_right')!.click();
            rootComponentFixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelectorAll('kbq-sidepanel-container').length).toBe(1);
        }));

        it('should not close a sidepanel when another one at a different position is clicked', fakeAsync(() => {
            sidepanelService.open(SimpleSidepanelExample, {
                position: KbqSidepanelPosition.Right,
                hasBackdrop: false
            });
            sidepanelService.open(SimpleSidepanelExample, {
                position: KbqSidepanelPosition.Left,
                hasBackdrop: false
            });
            rootComponentFixture.detectChanges();
            flush();

            overlayContainerElement.querySelector<HTMLElement>('.kbq-sidepanel-container_right')!.click();
            rootComponentFixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelectorAll('kbq-sidepanel-container').length).toBe(2);
        }));

        it('should close a template sidepanel from its close button', fakeAsync(() => {
            const templateRefFixture = TestBed.createComponent(ComponentWithCloseButtonTemplate);

            templateRefFixture.detectChanges();
            sidepanelService.open(templateRefFixture.componentInstance.templateRef());
            rootComponentFixture.detectChanges();
            flush();

            overlayContainerElement.querySelector<HTMLButtonElement>('button[kbq-sidepanel-close]')!.click();
            rootComponentFixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).toBeNull();
        }));
    });

    describe('config defaults', () => {
        it('should ignore config values that are explicitly undefined', () => {
            const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, {
                position: undefined,
                size: undefined
            });

            expect(sidepanelRef.config.position).toBe(KbqSidepanelPosition.Right);
            expect(sidepanelRef.config.size).toBe(KbqSidepanelSize.Medium);
            expect(sidepanelRef.containerInstance.size).toBe('kbq-sidepanel_medium');
            expect(overlayContainerElement.querySelector('.kbq-sidepanel-container_right')).not.toBeNull();
        });

        it('should lay out the host of a component sidepanel as a flex column', () => {
            sidepanelService.open(SimpleSidepanelExample);

            expect(
                overlayContainerElement.querySelector('.kbq-sidepanel-content > .kbq-sidepanel-content-host')
            ).not.toBeNull();
        });
    });
});

@Component({
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">Sidepanel Component Content</kbq-sidepanel-header>

        <kbq-sidepanel-body><div class="kbq-subheading">Sidepanel Component Body</div></kbq-sidepanel-body>

        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions align="right">
                <button kbq-button kbq-sidepanel-close>
                    <span>Close</span>
                </button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `
})
class ComponentForSidepanel {}

@Component({
    imports: [KbqButtonModule],
    template: `
        <button kbq-button type="button">Open sidepanel</button>
    `
})
class SidepanelTrigger {}

@Component({
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <kbq-sidepanel-body>
            <button cdkFocusInitial kbq-button type="button">Focused first</button>
        </kbq-sidepanel-body>
    `
})
class SidepanelWithFocusInitial {}

@Component({
    imports: [KbqSidepanelModule],
    template: `
        @if (showHeader()) {
            <kbq-sidepanel-header>Late title</kbq-sidepanel-header>
        }
        <kbq-sidepanel-body>Body</kbq-sidepanel-body>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SidepanelWithLateHeader {
    readonly showHeader = signal(false);
}

@Component({
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <ng-template>
            <kbq-sidepanel-header>Template sidepanel</kbq-sidepanel-header>
            <kbq-sidepanel-body>Body</kbq-sidepanel-body>
            <kbq-sidepanel-footer>
                <button kbq-button kbq-sidepanel-close>Close</button>
            </kbq-sidepanel-footer>
        </ng-template>
    `
})
class ComponentWithCloseButtonTemplate {
    readonly templateRef = viewChild.required(TemplateRef);
}

@Component({
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <form (ngSubmit)="onSubmit()">
            <kbq-sidepanel-body>Form content</kbq-sidepanel-body>
            <kbq-sidepanel-footer>
                <button kbq-button kbq-sidepanel-close>Close</button>
            </kbq-sidepanel-footer>
        </form>
    `
})
class SidepanelWithFormComponent {
    onSubmit() {}
}

@Component({
    selector: 'kbq-sidepanel-from-dropdown',
    imports: [
        KbqDropdownModule
    ],
    template: `
        <button #trigger="kbqDropdownTrigger" class="template-button" kbq-button [kbqDropdownTriggerFor]="dropdown">
            Open sidepanel from dropdown
        </button>
        <kbq-dropdown #dropdown>
            <ng-template kbqDropdownContent>
                <button kbq-dropdown-item (click)="showSidepanel()">open Component Sidepanel</button>
            </ng-template>
        </kbq-dropdown>
    `,
    // Testing for service with parent service
    providers: [KbqSidepanelService]
})
class SidepanelFromDropdownComponent {
    ss = injectCore(KbqSidepanelService);

    readonly trigger = viewChild.required<KbqDropdownTrigger>('trigger');

    showSidepanel() {
        this.ss.open(ComponentForSidepanel);
    }
}

const CUSTOM_TOKEN = new InjectionToken<string>('CustomToken');

@Component({
    template: '<div>Sidepanel with custom token</div>'
})
class SidepanelWithCustomToken {
    readonly tokenValue = injectCore(CUSTOM_TOKEN);
}

@Component({
    template: '<div>Simple Sidepanel</div>'
})
class SimpleSidepanelExample {
    sidepanelRef = injectCore<KbqSidepanelRef<SimpleSidepanelExample>>(KbqSidepanelRef);
    data = injectCore(KBQ_SIDEPANEL_DATA);
}

@Component({
    template: `
        <ng-template let-data let-sidepanelRef="sidepanelRef">
            {{ localValue }} {{ data?.value }}{{ setSidepanelRef(sidepanelRef) }}
        </ng-template>
    `
})
class ComponentWithTemplateForSidepanel {
    localValue: string;
    sidepanelRef: KbqSidepanelRef;

    readonly templateRef = viewChild.required(TemplateRef);

    setSidepanelRef(sidepanelRef: KbqSidepanelRef): string {
        this.sidepanelRef = sidepanelRef;

        return '';
    }
}

@Component({
    selector: 'root-component',
    template: `
        <div></div>
    `
})
class RootComponent {}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [
    SimpleSidepanelExample,
    SidepanelWithCustomToken,
    SidepanelWithFormComponent,
    SidepanelWithFocusInitial,
    SidepanelWithLateHeader,
    SidepanelTrigger,
    ComponentWithTemplateForSidepanel,
    ComponentWithCloseButtonTemplate,
    RootComponent,
    SidepanelFromDropdownComponent
];

@NgModule({
    imports: [
        KbqSidepanelModule,
        NoopAnimationsModule,
        KbqDropdownModule,
        KbqButtonModule,
        ...TEST_COMPONENTS
    ],
    exports: TEST_COMPONENTS
})
class SidepanelTestModule {}
