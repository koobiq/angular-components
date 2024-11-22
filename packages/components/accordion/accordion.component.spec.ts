import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KbqAccordion,
    KbqAccordionContent,
    KbqAccordionHeader,
    KbqAccordionItem,
    KbqAccordionModule,
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
            imports: [KbqAccordionModule],
            declarations: [
                TestApp,
                AccordionVariants,
                AccordionDefaultValue,
                AccordionValue,
                AccordionDisabled,
                AccordionDisabledItem,
                AccordionType,
                AccordionCollapsible
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
        });
    });
});

@Component({
    selector: 'test-app',
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
