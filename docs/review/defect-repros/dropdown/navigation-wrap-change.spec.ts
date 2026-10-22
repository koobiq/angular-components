import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UP_ARROW, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqDropdown, KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';

@Component({
    imports: [KbqDropdownModule],
    template: `
        <button [kbqDropdownTriggerFor]="dropdown">Open</button>
        <kbq-dropdown #dropdown="kbqDropdown" [navigationWithWrap]="wrap()">
            <button kbq-dropdown-item>First</button>
            <button kbq-dropdown-item>Second</button>
            <button kbq-dropdown-item>Last</button>
        </kbq-dropdown>
    `
})
class TestApp {
    readonly wrap = signal(false);
    readonly trigger = viewChild.required(KbqDropdownTrigger);
    readonly dropdown = viewChild.required(KbqDropdown);
}

describe('triage: navigationWithWrap changed after init', () => {
    function arrowUpFromFirstItem(initialWrap: boolean, laterWrap?: boolean): string {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.wrap.set(initialWrap);
        fixture.detectChanges();

        if (laterWrap !== undefined) {
            fixture.componentInstance.wrap.set(laterWrap);
            fixture.detectChanges();
            expect(fixture.componentInstance.dropdown().navigationWithWrap()).toBe(laterWrap);
        }

        fixture.componentInstance.trigger().open();
        fixture.detectChanges();

        const first = document.activeElement as HTMLElement;

        expect(first.textContent?.trim()).toBe('First');

        dispatchKeyboardEvent(first, 'keydown', UP_ARROW);
        fixture.detectChanges();

        return (document.activeElement as HTMLElement).textContent!.trim();
    }

    it('control: navigationWithWrap set from the start wraps from the first item to the last', () => {
        expect(arrowUpFromFirstItem(true)).toBe('Last');
    });

    it('DEFECT: navigationWithWrap switched on after init is ignored, Up on the first item stays put', () => {
        expect(arrowUpFromFirstItem(false, true)).toBe('First');
    });

    it('DEFECT: navigationWithWrap switched off after init is ignored, Up on the first item still wraps', () => {
        expect(arrowUpFromFirstItem(true, false)).toBe('Last');
    });
});
