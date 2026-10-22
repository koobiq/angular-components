import { Component, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqButtonToggle, KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { createKeyboardEvent, dispatchEvent, LEFT_ARROW, RIGHT_ARROW } from '@koobiq/components/core';

@Component({
    imports: [KbqButtonToggleModule],
    template: `
        <kbq-button-toggle-group aria-label="Colors">
            <kbq-button-toggle [value]="'a'">A</kbq-button-toggle>
            <kbq-button-toggle [value]="'b'">B</kbq-button-toggle>
            <kbq-button-toggle [value]="'c'">C</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class RadioGroup {
    readonly toggles = viewChildren(KbqButtonToggle);
}

describe('triage: button-toggle arrow keys with modifiers', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [RadioGroup] }));

    it.each([
        ['Alt + ArrowLeft (browser back)', LEFT_ARROW, 'altKey', 2],
        ['Ctrl + ArrowRight', RIGHT_ARROW, 'ctrlKey', 1],
        ['Shift + ArrowRight', RIGHT_ARROW, 'shiftKey', 1],
        ['Meta + ArrowLeft', LEFT_ARROW, 'metaKey', 2]
    ])('DEFECT: %s is prevented and moves the selection', (_, keyCode, modifier, expected) => {
        const fixture = TestBed.createComponent(RadioGroup);

        fixture.detectChanges();

        const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
        const event = createKeyboardEvent('keydown', keyCode);

        Object.defineProperty(event, modifier, { get: () => true });
        dispatchEvent(buttons[0], event);
        fixture.detectChanges();

        expect((event as KeyboardEvent)[modifier as 'altKey']).toBe(true);
        expect(event.defaultPrevented).toBe(true);
        expect(fixture.componentInstance.toggles()[expected].checked).toBe(true);
    });
});
