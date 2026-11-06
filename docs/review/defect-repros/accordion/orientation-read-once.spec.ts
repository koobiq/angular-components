import { Direction, Directionality } from '@angular/cdk/bidi';
import { LEFT_ARROW, RIGHT_ARROW } from '@angular/cdk/keycodes';
import { Component, EventEmitter, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KbqAccordion,
    KbqAccordionItem,
    KbqAccordionModule,
    KbqAccordionOrientation,
    KbqAccordionTrigger
} from '@koobiq/components/accordion';
import { dispatchKeyboardEvent } from '@koobiq/components/core';

@Component({
    selector: 'test-app',
    imports: [KbqAccordionModule],
    template: `
        <kbq-accordion [orientation]="orientation()">
            @for (name of names; track name) {
                <kbq-accordion-item [value]="name">
                    <kbq-accordion-header>
                        <button kbq-accordion-trigger type="button">{{ name }}</button>
                    </kbq-accordion-header>
                    <kbq-accordion-content>Content {{ name }}</kbq-accordion-content>
                </kbq-accordion-item>
            }
        </kbq-accordion>
    `
})
class TestApp {
    readonly orientation = signal<KbqAccordionOrientation>('vertical');
    readonly names = ['a', 'b', 'c'];
}

describe('triage: orientation and direction are read once on content init', () => {
    let fixture: ComponentFixture<TestApp>;
    let accordion: KbqAccordion;
    let items: KbqAccordionItem[];
    let triggers: HTMLElement[];

    const query = () => {
        accordion = fixture.debugElement.query(By.directive(KbqAccordion)).componentInstance;
        items = fixture.debugElement
            .queryAll(By.directive(KbqAccordionItem))
            .map((d) => d.injector.get(KbqAccordionItem));
        triggers = fixture.debugElement.queryAll(By.directive(KbqAccordionTrigger)).map((d) => d.nativeElement);
    };

    afterEach(() => {
        if (fixture?.nativeElement?.parentNode === document.body) {
            document.body.removeChild(fixture.nativeElement);
        }
    });

    it('DEFECT: switching orientation to horizontal at runtime updates data-orientation but not the arrow keys', () => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
        document.body.appendChild(fixture.nativeElement);
        query();

        fixture.componentInstance.orientation.set('horizontal');
        fixture.detectChanges();

        expect(
            fixture.debugElement.query(By.directive(KbqAccordion)).nativeElement.getAttribute('data-orientation')
        ).toBe('horizontal');

        accordion.setActiveItem(items[0]);
        expect(document.activeElement).toBe(triggers[0]);

        dispatchKeyboardEvent(triggers[0], 'keydown', RIGHT_ARROW);
        fixture.detectChanges();

        // An accordion created horizontal moves to the next header here.
        expect(document.activeElement).toBe(triggers[0]);
    });

    it('DEFECT: a runtime switch to right-to-left is not followed by the horizontal arrow keys', () => {
        const change = new EventEmitter<Direction>();
        const dir = { value: 'ltr' as Direction, change };

        TestBed.overrideProvider(Directionality, { useValue: dir });

        fixture = TestBed.createComponent(TestApp);
        fixture.componentInstance.orientation.set('horizontal');
        fixture.detectChanges();
        document.body.appendChild(fixture.nativeElement);
        query();

        dir.value = 'rtl';
        change.emit('rtl');
        fixture.detectChanges();

        accordion.setActiveItem(items[1]);
        expect(document.activeElement).toBe(triggers[1]);

        // In right-to-left, Right should move to the previous header (a); it still moves to the next one (c).
        dispatchKeyboardEvent(triggers[1], 'keydown', RIGHT_ARROW);
        fixture.detectChanges();
        expect(document.activeElement).toBe(triggers[2]);

        dispatchKeyboardEvent(triggers[2], 'keydown', LEFT_ARROW);
        fixture.detectChanges();
        expect(document.activeElement).toBe(triggers[1]);
    });
});
