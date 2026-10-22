import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAccordion, KbqAccordionItem, KbqAccordionModule, KbqAccordionTrigger } from '@koobiq/components/accordion';

@Component({
    selector: 'test-app',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion>
            <kbq-accordion-item value="element">
                <kbq-accordion-header>
                    <kbq-accordion-trigger>Element form</kbq-accordion-trigger>
                </kbq-accordion-header>
                <kbq-accordion-content>Content 1</kbq-accordion-content>
            </kbq-accordion-item>
            <kbq-accordion-item value="div">
                <kbq-accordion-header>
                    <div kbq-accordion-trigger>Div host</div>
                </kbq-accordion-header>
                <kbq-accordion-content>Content 2</kbq-accordion-content>
            </kbq-accordion-item>
        </kbq-accordion>
    `
})
class TestApp {}

describe('triage: a trigger host that is not a native button', () => {
    let fixture: ComponentFixture<TestApp>;

    afterEach(() => {
        if (fixture?.nativeElement?.parentNode === document.body) {
            document.body.removeChild(fixture.nativeElement);
        }
    });

    it('DEFECT: <kbq-accordion-trigger> and <div kbq-accordion-trigger> get role="button" but no tabindex and cannot take focus', () => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
        document.body.appendChild(fixture.nativeElement);

        const triggers: HTMLElement[] = fixture.debugElement
            .queryAll(By.directive(KbqAccordionTrigger))
            .map((d) => d.nativeElement);

        expect(triggers.map((trigger) => trigger.tagName)).toEqual(['KBQ-ACCORDION-TRIGGER', 'DIV']);

        for (const trigger of triggers) {
            expect(trigger.getAttribute('role')).toBe('button');
            expect(trigger.hasAttribute('tabindex')).toBe(false);
            expect(trigger.tabIndex).toBe(-1);

            trigger.focus();
            expect(document.activeElement).not.toBe(trigger);
        }

        // Arrow-key navigation focuses through the same trigger focus(), so it cannot land on them either.
        const accordion = fixture.debugElement.query(By.directive(KbqAccordion)).componentInstance as KbqAccordion;
        const item = fixture.debugElement.queryAll(By.directive(KbqAccordionItem))[1].injector.get(KbqAccordionItem);

        accordion.setActiveItem(item);
        expect(document.activeElement).not.toBe(triggers[1]);
    });
});
