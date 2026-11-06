import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAccordion, KbqAccordionModule, KbqAccordionTrigger } from '@koobiq/components/accordion';

@Component({
    selector: 'test-app',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion>
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

describe('triage: valueChange in single mode when the expanded item switches', () => {
    let fixture: ComponentFixture<TestApp>;
    let triggers: HTMLElement[];
    let emissions: Array<string | string[]>;

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        const accordion = fixture.debugElement.query(By.directive(KbqAccordion)).componentInstance as KbqAccordion;

        emissions = [];
        accordion.valueChange.subscribe((value) => emissions.push(value));

        triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger)).map((d) => d.nativeElement);
    });

    it('DEFECT: switching from the first item to the second emits twice, first with the old value', () => {
        triggers[0].click();
        fixture.detectChanges();
        expect(emissions).toEqual(['a']);

        emissions.length = 0;

        triggers[1].click();
        fixture.detectChanges();

        expect(emissions).toEqual(['a', 'b']);
    });

    it('DEFECT: switching from the second item to the first emits the new value twice', () => {
        triggers[1].click();
        fixture.detectChanges();
        expect(emissions).toEqual(['b']);

        emissions.length = 0;

        triggers[0].click();
        fixture.detectChanges();

        expect(emissions).toEqual(['a', 'a']);
    });
});
