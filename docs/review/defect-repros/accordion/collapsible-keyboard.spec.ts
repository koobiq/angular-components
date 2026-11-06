import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAccordion, KbqAccordionItem, KbqAccordionModule, KbqAccordionTrigger } from '@koobiq/components/accordion';
import { dispatchKeyboardEvent } from '@koobiq/components/core';

@Component({
    selector: 'test-app',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [collapsible]="false">
            <kbq-accordion-item value="a">
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">A</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Content A</kbq-accordion-content>
            </kbq-accordion-item>
            <kbq-accordion-item value="b">
                <kbq-accordion-header>
                    <button kbq-accordion-trigger type="button">B</button>
                </kbq-accordion-header>
                <kbq-accordion-content>Content B</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class TestApp {}

describe('triage: collapsible=false is enforced on click only', () => {
    let fixture: ComponentFixture<TestApp>;
    let triggers: HTMLElement[];
    let items: HTMLElement[];

    const expandFirstByClick = () => {
        triggers[0].click();
        fixture.detectChanges();
        expect(items[0].getAttribute('data-state')).toBe('open');

        // Control: a second click is blocked by collapsible=false.
        triggers[0].click();
        fixture.detectChanges();
        expect(items[0].getAttribute('data-state')).toBe('open');
    };

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger)).map((d) => d.nativeElement);
        items = fixture.debugElement.queryAll(By.directive(KbqAccordionItem)).map((d) => d.nativeElement);
    });

    it('DEFECT: Enter on the trigger of the expanded item collapses it despite collapsible=false', () => {
        expandFirstByClick();

        const event = dispatchKeyboardEvent(triggers[0], 'keydown', ENTER);

        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
        expect(items[0].getAttribute('data-state')).toBe('closed');
        expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
    });

    it('DEFECT: Space on the trigger of the expanded item collapses it despite collapsible=false', () => {
        expandFirstByClick();

        dispatchKeyboardEvent(triggers[0], 'keydown', SPACE);
        fixture.detectChanges();

        expect(items[0].getAttribute('data-state')).toBe('closed');
    });

    it('DEFECT: toggle(), close() and closeAll() collapse the expanded item despite collapsible=false', () => {
        const accordion = fixture.debugElement.query(By.directive(KbqAccordion)).componentInstance as KbqAccordion;
        const item = fixture.debugElement.queryAll(By.directive(KbqAccordionItem))[0].injector.get(KbqAccordionItem);

        expandFirstByClick();
        item.toggle();
        fixture.detectChanges();
        expect(items[0].getAttribute('data-state')).toBe('closed');

        expandFirstByClick();
        item.close();
        fixture.detectChanges();
        expect(items[0].getAttribute('data-state')).toBe('closed');

        expandFirstByClick();
        accordion.closeAll();
        fixture.detectChanges();
        expect(items[0].getAttribute('data-state')).toBe('closed');
    });
});
