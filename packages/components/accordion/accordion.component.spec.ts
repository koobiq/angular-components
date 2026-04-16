import { ENTER, SPACE, TAB } from '@angular/cdk/keycodes';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import {
    KbqAccordion,
    KbqAccordionContent,
    KbqAccordionHeader,
    KbqAccordionItem,
    KbqAccordionModule,
    KbqAccordionOrientation,
    KbqAccordionTrigger,
    KbqAccordionType,
    KbqAccordionVariant
} from './index';

describe('KbqAccordion', () => {
    let fixture: ComponentFixture<TestApp>;
    let accordionDebugElement: DebugElement;
    let accordionItemDebugElement: DebugElement;
    let accordionHeaderDebugElement: DebugElement;
    let accordionTriggerDebugElement: DebugElement;
    let accordionContentDebugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqAccordionModule,
                TestApp,
                AccordionVariants,
                AccordionDefaultValue,
                AccordionValue,
                AccordionDisabled,
                AccordionDisabledItem,
                AccordionType,
                AccordionCollapsible,
                AccordionOpenCloseAll,
                AccordionEvents,
                AccordionOrientation
            ]
        }).compileComponents();
    });

    describe('default', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            accordionDebugElement = fixture.debugElement.query(By.directive(KbqAccordion));
            accordionItemDebugElement = fixture.debugElement.query(By.directive(KbqAccordionItem));
            accordionHeaderDebugElement = fixture.debugElement.query(By.directive(KbqAccordionHeader));
            accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
            accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));
        });

        it('should add classes', () => {
            expect(accordionDebugElement.nativeElement.classList).toContain('kbq-accordion');
            expect(accordionItemDebugElement.nativeElement.classList).toContain('kbq-accordion-item');
            expect(accordionHeaderDebugElement.nativeElement.classList).toContain('kbq-accordion-header');
            expect(accordionTriggerDebugElement.nativeElement.classList).toContain('kbq-accordion-trigger');
            expect(accordionContentDebugElement.nativeElement.classList).toContain('kbq-accordion-content');
        });

        it('default variant', () => {
            expect(accordionTriggerDebugElement.nativeElement.classList).toContain('kbq-accordion-trigger_fill');
        });
    });

    describe('params', () => {
        it('accordion variants', () => {
            fixture = TestBed.createComponent(AccordionVariants);
            fixture.detectChanges();

            accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));

            const component = fixture.debugElement.componentInstance;

            expect(accordionTriggerDebugElement.nativeElement.classList).toContain('kbq-accordion-trigger_hug');

            component.selectedVariant = KbqAccordionVariant.fill;
            fixture.detectChanges();
            expect(accordionTriggerDebugElement.nativeElement.classList).toContain('kbq-accordion-trigger_fill');

            component.selectedVariant = KbqAccordionVariant.hugSpaceBetween;
            fixture.detectChanges();
            expect(accordionTriggerDebugElement.nativeElement.classList).toContain(
                'kbq-accordion-trigger_hug-space-between'
            );
        });

        describe('defaultValue', () => {
            it('should be closed in init', () => {
                fixture = TestBed.createComponent(AccordionDefaultValue);
                fixture.detectChanges();

                accordionItemDebugElement = fixture.debugElement.query(By.directive(KbqAccordionItem));
                accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));

                expect(accordionItemDebugElement.nativeElement.getAttribute('data-state')).toBe('closed');
                expect(accordionContentDebugElement.nativeElement.getAttribute('data-state')).toBe('closed');
            });

            it('should be opened on init', () => {
                fixture = TestBed.createComponent(AccordionDefaultValue);
                const component = fixture.debugElement.componentInstance;

                component.defaultValue = 'item-1';
                fixture.detectChanges();

                accordionItemDebugElement = fixture.debugElement.query(By.directive(KbqAccordionItem));
                accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));

                expect(accordionItemDebugElement.nativeElement.getAttribute('data-state')).toBe('open');
                expect(accordionContentDebugElement.nativeElement.getAttribute('data-state')).toBe('open');
            });
        });

        describe('value', () => {
            it('should change state', () => {
                fixture = TestBed.createComponent(AccordionValue);
                fixture.detectChanges();

                const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
                const itemsContent = fixture.debugElement.queryAll(By.directive(KbqAccordionContent));

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
                expect(itemsContent[0].nativeElement.getAttribute('data-state')).toBe('closed');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');
                expect(itemsContent[1].nativeElement.getAttribute('data-state')).toBe('closed');

                const component = fixture.debugElement.componentInstance;

                component.value = 'item-1';
                fixture.detectChanges();
                expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');
                expect(itemsContent[0].nativeElement.getAttribute('data-state')).toBe('open');

                component.value = 'item-2';
                fixture.detectChanges();
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('open');
                expect(itemsContent[1].nativeElement.getAttribute('data-state')).toBe('open');
            });
        });

        describe('disabled', () => {
            it('should change state for items', () => {
                fixture = TestBed.createComponent(AccordionDisabled);
                fixture.detectChanges();

                const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
                const itemsContent = fixture.debugElement.queryAll(By.directive(KbqAccordionContent));

                expect(items[0].nativeElement.getAttribute('data-disabled')).toBe('false');
                expect(itemsContent[0].nativeElement.getAttribute('data-disabled')).toBe('false');
                expect(items[1].nativeElement.getAttribute('data-disabled')).toBe('false');
                expect(itemsContent[1].nativeElement.getAttribute('data-disabled')).toBe('false');

                const component = fixture.debugElement.componentInstance;

                component.disabled = true;
                fixture.detectChanges();

                expect(items[0].nativeElement.getAttribute('data-disabled')).toBe('true');
                expect(itemsContent[0].nativeElement.getAttribute('data-disabled')).toBe('true');
                expect(items[1].nativeElement.getAttribute('data-disabled')).toBe('true');
                expect(itemsContent[1].nativeElement.getAttribute('data-disabled')).toBe('true');
            });

            it('should change state for item', () => {
                fixture = TestBed.createComponent(AccordionDisabledItem);
                fixture.detectChanges();

                const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
                const itemsContent = fixture.debugElement.queryAll(By.directive(KbqAccordionContent));

                expect(items[0].nativeElement.getAttribute('data-disabled')).toBe('false');
                expect(itemsContent[0].nativeElement.getAttribute('data-disabled')).toBe('false');
                expect(items[1].nativeElement.getAttribute('data-disabled')).toBe('false');
                expect(itemsContent[1].nativeElement.getAttribute('data-disabled')).toBe('false');

                const component = fixture.debugElement.componentInstance;

                component.disabledItem = true;
                fixture.detectChanges();

                expect(items[0].nativeElement.getAttribute('data-disabled')).toBe('true');
                expect(itemsContent[0].nativeElement.getAttribute('data-disabled')).toBe('true');
                expect(items[1].nativeElement.getAttribute('data-disabled')).toBe('false');
                expect(itemsContent[1].nativeElement.getAttribute('data-disabled')).toBe('false');
            });
        });

        describe('type', () => {
            it('should open only one item with [type]="single" (default)', () => {
                fixture = TestBed.createComponent(AccordionType);
                fixture.detectChanges();

                const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');

                triggers[0].nativeElement.click();
                fixture.detectChanges();

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');

                triggers[1].nativeElement.click();
                fixture.detectChanges();

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('open');
            });

            it('should open items with [type]="multiple"', () => {
                fixture = TestBed.createComponent(AccordionType);
                fixture.debugElement.componentInstance.type = 'multiple';
                fixture.detectChanges();

                const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');

                triggers[0].nativeElement.click();
                fixture.detectChanges();

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');

                triggers[1].nativeElement.click();
                fixture.detectChanges();

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('open');
            });
        });

        describe('collapsible', () => {
            it('should prevent collapse for one opened item', () => {
                fixture = TestBed.createComponent(AccordionCollapsible);
                fixture.detectChanges();

                const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');

                triggers[0].nativeElement.click();
                fixture.detectChanges();

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');

                triggers[0].nativeElement.click();
                fixture.detectChanges();

                expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');
                expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');
            });

            it('collapsible=true (default) should allow closing open item', () => {
                fixture = TestBed.createComponent(AccordionType);
                fixture.detectChanges();

                const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

                triggers[0].nativeElement.click();
                fixture.detectChanges();
                expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');

                triggers[0].nativeElement.click();
                fixture.detectChanges();
                expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
            });
        });
    });

    describe('openAll / closeAll', () => {
        it('openAll should open all items in multiple mode', () => {
            fixture = TestBed.createComponent(AccordionOpenCloseAll);
            fixture.detectChanges();

            const accordion = fixture.debugElement.query(By.directive(KbqAccordion)).componentInstance as KbqAccordion;
            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));

            accordion.openAll();
            fixture.detectChanges();

            expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');
            expect(items[1].nativeElement.getAttribute('data-state')).toBe('open');
        });

        it('closeAll should close all items', () => {
            fixture = TestBed.createComponent(AccordionOpenCloseAll);
            fixture.detectChanges();

            const accordion = fixture.debugElement.query(By.directive(KbqAccordion)).componentInstance as KbqAccordion;
            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));

            accordion.openAll();
            fixture.detectChanges();

            accordion.closeAll();
            fixture.detectChanges();

            expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
            expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');
        });

        it('openAll should not open items in single mode', () => {
            fixture = TestBed.createComponent(AccordionOpenCloseAll);
            fixture.debugElement.componentInstance.type = 'single';
            fixture.detectChanges();

            const accordion = fixture.debugElement.query(By.directive(KbqAccordion)).componentInstance as KbqAccordion;
            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));

            accordion.openAll();
            fixture.detectChanges();

            expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
            expect(items[1].nativeElement.getAttribute('data-state')).toBe('closed');
        });
    });

    describe('events', () => {
        it('should emit opened and expandedChange(true) when item is opened', () => {
            fixture = TestBed.createComponent(AccordionEvents);
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqAccordionItem)).injector.get(KbqAccordionItem);
            const trigger = fixture.debugElement.query(By.directive(KbqAccordionTrigger));

            const openedSpy = jest.fn();
            const expandedChangeSpy = jest.fn();

            item.opened.subscribe(openedSpy);
            item.expandedChange.subscribe(expandedChangeSpy);

            trigger.nativeElement.click();
            fixture.detectChanges();

            expect(openedSpy).toHaveBeenCalledTimes(1);
            expect(expandedChangeSpy).toHaveBeenCalledWith(true);
        });

        it('should emit closed and expandedChange(false) when item is closed', () => {
            fixture = TestBed.createComponent(AccordionEvents);
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqAccordionItem)).injector.get(KbqAccordionItem);
            const trigger = fixture.debugElement.query(By.directive(KbqAccordionTrigger));

            const closedSpy = jest.fn();
            const expandedChangeSpy = jest.fn();

            item.closed.subscribe(closedSpy);
            item.expandedChange.subscribe(expandedChangeSpy);

            trigger.nativeElement.click();
            fixture.detectChanges();
            trigger.nativeElement.click();
            fixture.detectChanges();

            expect(closedSpy).toHaveBeenCalledTimes(1);
            expect(expandedChangeSpy).toHaveBeenCalledWith(false);
        });

        it('should emit onValueChange when item state changes', () => {
            fixture = TestBed.createComponent(AccordionEvents);
            fixture.detectChanges();

            const accordion = fixture.debugElement.query(By.directive(KbqAccordion)).componentInstance as KbqAccordion;
            const trigger = fixture.debugElement.query(By.directive(KbqAccordionTrigger));

            const onValueChangeSpy = jest.fn();

            accordion.onValueChange.subscribe(onValueChangeSpy);

            trigger.nativeElement.click();
            fixture.detectChanges();

            expect(onValueChangeSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('keyboard navigation', () => {
        it('ENTER should toggle active item', () => {
            fixture = TestBed.createComponent(AccordionType);
            fixture.detectChanges();

            const accordionEl = fixture.debugElement.query(By.directive(KbqAccordion));
            const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));
            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));

            triggers[0].nativeElement.click();
            fixture.detectChanges();

            const accordion = accordionEl.componentInstance as KbqAccordion;

            accordion.setActiveItem(items[0].componentInstance as KbqAccordionItem);

            dispatchKeyboardEvent(accordionEl.nativeElement, 'keydown', ENTER);
            fixture.detectChanges();

            expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
        });

        it('SPACE should toggle active item', () => {
            fixture = TestBed.createComponent(AccordionType);
            fixture.detectChanges();

            const accordionEl = fixture.debugElement.query(By.directive(KbqAccordion));
            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));

            const accordion = accordionEl.componentInstance as KbqAccordion;

            accordion.setActiveItem(items[0].componentInstance as KbqAccordionItem);

            dispatchKeyboardEvent(accordionEl.nativeElement, 'keydown', SPACE);
            fixture.detectChanges();

            expect(items[0].nativeElement.getAttribute('data-state')).toBe('open');
        });

        it('TAB should move focus to the next item', () => {
            fixture = TestBed.createComponent(AccordionType);
            fixture.detectChanges();

            const accordionEl = fixture.debugElement.query(By.directive(KbqAccordion));
            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));

            const accordion = accordionEl.componentInstance as KbqAccordion;

            accordion.setActiveItem(items[0].injector.get(KbqAccordionItem));
            expect(accordion['keyManager'].activeItemIndex).toBe(0);

            dispatchKeyboardEvent(accordionEl.nativeElement, 'keydown', TAB);
            fixture.detectChanges();

            expect(accordion['keyManager'].activeItemIndex).toBe(1);
        });

        it('Shift+TAB should move focus to the previous item', () => {
            fixture = TestBed.createComponent(AccordionType);
            fixture.detectChanges();

            const accordionEl = fixture.debugElement.query(By.directive(KbqAccordion));
            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));

            const accordion = accordionEl.componentInstance as KbqAccordion;

            accordion.setActiveItem(items[1].injector.get(KbqAccordionItem));
            expect(accordion['keyManager'].activeItemIndex).toBe(1);

            const event = new KeyboardEvent('keydown', {
                keyCode: TAB,
                shiftKey: true,
                bubbles: true
            } as KeyboardEventInit);

            accordionEl.nativeElement.dispatchEvent(event);
            fixture.detectChanges();

            expect(accordion['keyManager'].activeItemIndex).toBe(0);
        });
    });

    describe('orientation', () => {
        it('default orientation should be vertical', () => {
            fixture = TestBed.createComponent(AccordionOrientation);
            fixture.detectChanges();

            const accordion = fixture.debugElement.query(By.directive(KbqAccordion));
            const item = fixture.debugElement.query(By.directive(KbqAccordionItem));
            const trigger = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
            const content = fixture.debugElement.query(By.directive(KbqAccordionContent));

            expect(accordion.nativeElement.getAttribute('data-orientation')).toBe('vertical');
            expect(item.nativeElement.getAttribute('data-orientation')).toBe('vertical');
            expect(trigger.nativeElement.getAttribute('data-orientation')).toBe('vertical');
            expect(content.nativeElement.getAttribute('data-orientation')).toBe('vertical');
        });

        it('should apply horizontal orientation', () => {
            fixture = TestBed.createComponent(AccordionOrientation);
            fixture.debugElement.componentInstance.orientation = 'horizontal';
            fixture.detectChanges();

            const accordion = fixture.debugElement.query(By.directive(KbqAccordion));
            const item = fixture.debugElement.query(By.directive(KbqAccordionItem));
            const trigger = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
            const content = fixture.debugElement.query(By.directive(KbqAccordionContent));

            expect(accordion.nativeElement.getAttribute('data-orientation')).toBe('horizontal');
            expect(item.nativeElement.getAttribute('data-orientation')).toBe('horizontal');
            expect(trigger.nativeElement.getAttribute('data-orientation')).toBe('horizontal');
            expect(content.nativeElement.getAttribute('data-orientation')).toBe('horizontal');
        });
    });

    describe('trigger attributes', () => {
        it('should have role="button" on trigger', () => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
            expect(accordionTriggerDebugElement.nativeElement.getAttribute('role')).toBe('button');
        });

        it('aria-expanded should be false when item is closed', () => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
            expect(accordionTriggerDebugElement.nativeElement.getAttribute('aria-expanded')).toBe('false');
        });

        it('aria-expanded should be true when item is open', () => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
            accordionTriggerDebugElement.nativeElement.click();
            fixture.detectChanges();

            expect(accordionTriggerDebugElement.nativeElement.getAttribute('aria-expanded')).toBe('true');
        });

        it('data-state on trigger should match item state', () => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
            accordionItemDebugElement = fixture.debugElement.query(By.directive(KbqAccordionItem));

            expect(accordionTriggerDebugElement.nativeElement.getAttribute('data-state')).toBe('closed');

            accordionTriggerDebugElement.nativeElement.click();
            fixture.detectChanges();

            expect(accordionTriggerDebugElement.nativeElement.getAttribute('data-state')).toBe('open');
            expect(accordionItemDebugElement.nativeElement.getAttribute('data-state')).toBe('open');
        });

        it('should set aria-disabled on trigger when item is disabled', () => {
            fixture = TestBed.createComponent(AccordionDisabledItem);
            fixture.debugElement.componentInstance.disabledItem = true;
            fixture.detectChanges();

            const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

            expect(triggers[0].nativeElement.getAttribute('aria-disabled')).toBe('true');
            expect(triggers[0].nativeElement.hasAttribute('disabled')).toBe(false);
            expect(triggers[1].nativeElement.getAttribute('aria-disabled')).toBe('false');
        });
    });

    describe('content attributes', () => {
        it('should have role="region" on content', () => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));
            expect(accordionContentDebugElement.nativeElement.getAttribute('role')).toBe('region');
        });

        it('hidden attribute should be "true" when closed', () => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));
            expect(accordionContentDebugElement.nativeElement.hasAttribute('hidden')).toBe(true);
        });

        it('hidden attribute should be "false" when open', () => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.directive(KbqAccordionTrigger));

            accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));

            trigger.nativeElement.click();
            fixture.detectChanges();

            expect(accordionContentDebugElement.nativeElement.hasAttribute('hidden')).toBe(false);
        });
    });

    describe('ARIA attributes', () => {
        describe('trigger id and aria-controls', () => {
            it('should set an id on the trigger element', () => {
                fixture = TestBed.createComponent(TestApp);
                fixture.detectChanges();

                accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
                const triggerId = accordionTriggerDebugElement.nativeElement.getAttribute('id');

                expect(triggerId).toBeTruthy();
                expect(triggerId).toMatch(/^kbq-accordion-item-\d+-trigger$/);
            });

            it('should set aria-controls on the trigger pointing to the content id', () => {
                fixture = TestBed.createComponent(TestApp);
                fixture.detectChanges();

                accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
                accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));

                const ariaControls = accordionTriggerDebugElement.nativeElement.getAttribute('aria-controls');
                const contentId = accordionContentDebugElement.nativeElement.getAttribute('id');

                expect(ariaControls).toBeTruthy();
                expect(ariaControls).toBe(contentId);
            });

            it('trigger id and content id should use matching item id prefix', () => {
                fixture = TestBed.createComponent(TestApp);
                fixture.detectChanges();

                accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
                accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));

                const triggerId = accordionTriggerDebugElement.nativeElement.getAttribute('id');
                const contentId = accordionContentDebugElement.nativeElement.getAttribute('id');

                expect(triggerId).toMatch(/^kbq-accordion-item-\d+-trigger$/);
                expect(contentId).toMatch(/^kbq-accordion-item-\d+-content$/);

                const triggerBase = triggerId.replace(/-trigger$/, '');
                const contentBase = contentId.replace(/-content$/, '');

                expect(triggerBase).toBe(contentBase);
            });
        });

        describe('content aria-labelledby', () => {
            it('should set an id on the content element', () => {
                fixture = TestBed.createComponent(TestApp);
                fixture.detectChanges();

                accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));
                const contentId = accordionContentDebugElement.nativeElement.getAttribute('id');

                expect(contentId).toBeTruthy();
                expect(contentId).toMatch(/^kbq-accordion-item-\d+-content$/);
            });

            it('should set aria-labelledby on the content region pointing to the trigger id', () => {
                fixture = TestBed.createComponent(TestApp);
                fixture.detectChanges();

                accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
                accordionContentDebugElement = fixture.debugElement.query(By.directive(KbqAccordionContent));

                const ariaLabelledby = accordionContentDebugElement.nativeElement.getAttribute('aria-labelledby');
                const triggerId = accordionTriggerDebugElement.nativeElement.getAttribute('id');

                expect(ariaLabelledby).toBeTruthy();
                expect(ariaLabelledby).toBe(triggerId);
            });
        });

        describe('multiple items have unique ids', () => {
            it('each trigger should have a unique id', () => {
                fixture = TestBed.createComponent(AccordionType);
                fixture.detectChanges();

                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));
                const ids = triggers.map((t) => t.nativeElement.getAttribute('id'));

                expect(ids[0]).not.toBe(ids[1]);
                expect(ids[0]).toMatch(/^kbq-accordion-item-\d+-trigger$/);
                expect(ids[1]).toMatch(/^kbq-accordion-item-\d+-trigger$/);
            });

            it('each content region should have a unique id', () => {
                fixture = TestBed.createComponent(AccordionType);
                fixture.detectChanges();

                const contents = fixture.debugElement.queryAll(By.directive(KbqAccordionContent));
                const ids = contents.map((c) => c.nativeElement.getAttribute('id'));

                expect(ids[0]).not.toBe(ids[1]);
            });

            it('aria-controls on each trigger should reference its own content', () => {
                fixture = TestBed.createComponent(AccordionType);
                fixture.detectChanges();

                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));
                const contents = fixture.debugElement.queryAll(By.directive(KbqAccordionContent));

                expect(triggers[0].nativeElement.getAttribute('aria-controls')).toBe(
                    contents[0].nativeElement.getAttribute('id')
                );
                expect(triggers[1].nativeElement.getAttribute('aria-controls')).toBe(
                    contents[1].nativeElement.getAttribute('id')
                );
            });
        });

        describe('header heading role', () => {
            it('should have role="heading" on the header element', () => {
                fixture = TestBed.createComponent(TestApp);
                fixture.detectChanges();

                accordionHeaderDebugElement = fixture.debugElement.query(By.directive(KbqAccordionHeader));
                expect(accordionHeaderDebugElement.nativeElement.getAttribute('role')).toBe('heading');
            });
        });

        describe('aria-disabled on trigger', () => {
            it('should have aria-disabled="false" when item is enabled', () => {
                fixture = TestBed.createComponent(TestApp);
                fixture.detectChanges();

                accordionTriggerDebugElement = fixture.debugElement.query(By.directive(KbqAccordionTrigger));
                expect(accordionTriggerDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('false');
            });

            it('should have aria-disabled="true" when item is disabled', () => {
                fixture = TestBed.createComponent(AccordionDisabledItem);
                fixture.debugElement.componentInstance.disabledItem = true;
                fixture.detectChanges();

                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

                expect(triggers[0].nativeElement.getAttribute('aria-disabled')).toBe('true');
            });

            it('disabled trigger should not have the HTML disabled attribute', () => {
                fixture = TestBed.createComponent(AccordionDisabledItem);
                fixture.debugElement.componentInstance.disabledItem = true;
                fixture.detectChanges();

                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

                expect(triggers[0].nativeElement.hasAttribute('disabled')).toBe(false);
            });

            it('should update aria-disabled reactively when disabled state changes', () => {
                fixture = TestBed.createComponent(AccordionDisabledItem);
                fixture.detectChanges();

                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

                expect(triggers[0].nativeElement.getAttribute('aria-disabled')).toBe('false');

                fixture.debugElement.componentInstance.disabledItem = true;
                fixture.detectChanges();

                expect(triggers[0].nativeElement.getAttribute('aria-disabled')).toBe('true');
            });

            it('should have aria-disabled="true" when entire accordion is disabled', () => {
                fixture = TestBed.createComponent(AccordionDisabled);
                fixture.debugElement.componentInstance.disabled = true;
                fixture.detectChanges();

                const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

                expect(triggers[0].nativeElement.getAttribute('aria-disabled')).toBe('true');
                expect(triggers[1].nativeElement.getAttribute('aria-disabled')).toBe('true');
            });
        });
    });

    describe('disabled — interaction', () => {
        it('click on disabled item should not open it', () => {
            fixture = TestBed.createComponent(AccordionDisabledItem);
            fixture.debugElement.componentInstance.disabledItem = true;
            fixture.detectChanges();

            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
            const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

            triggers[0].nativeElement.click();
            fixture.detectChanges();

            expect(items[0].nativeElement.getAttribute('data-state')).toBe('closed');
        });

        it('click on non-disabled item should still work when another item is disabled', () => {
            fixture = TestBed.createComponent(AccordionDisabledItem);
            fixture.debugElement.componentInstance.disabledItem = true;
            fixture.detectChanges();

            const items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem));
            const triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger));

            triggers[1].nativeElement.click();
            fixture.detectChanges();

            expect(items[1].nativeElement.getAttribute('data-state')).toBe('open');
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion>
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class TestApp {}

@Component({
    selector: 'accordion-variant',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [variant]="selectedVariant">
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionVariants {
    selectedVariant: KbqAccordionVariant = KbqAccordionVariant.hug;
}

@Component({
    selector: 'accordion-default-value',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [defaultValue]="defaultValue">
            <kbq-accordion-item [value]="'item-1'">
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionDefaultValue {
    defaultValue: string;
}

@Component({
    selector: 'accordion-value',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [value]="value">
            <kbq-accordion-item [value]="'item-1'">
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
            <kbq-accordion-item [value]="'item-2'">
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionValue {
    value: string;
}

@Component({
    selector: 'accordion-disabled',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [disabled]="disabled">
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionDisabled {
    disabled: boolean;
}

@Component({
    selector: 'accordion-disabled-item',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion>
            <kbq-accordion-item [disabled]="disabledItem">
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionDisabledItem {
    disabledItem: boolean;
}

@Component({
    selector: 'accordion-type',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [type]="type">
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionType {
    type: KbqAccordionType;
}

@Component({
    selector: 'accordion-collapsible',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [collapsible]="false">
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionCollapsible {}

@Component({
    selector: 'accordion-open-close-all',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [type]="type">
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Item 1</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Content 1</kbq-accordion-content>
            </kbq-accordion-item>
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Item 2</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Content 2</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionOpenCloseAll {
    type: KbqAccordionType = 'multiple';
}

@Component({
    selector: 'accordion-events',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion>
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionEvents {}

@Component({
    selector: 'accordion-orientation',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [orientation]="orientation">
            <kbq-accordion-item>
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">Is it accessible?</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Yes. It adheres to the WAI-ARIA design pattern.</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class AccordionOrientation {
    orientation: KbqAccordionOrientation = 'vertical';
}
