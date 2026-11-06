import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqAutocompleteModule, KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import { KbqLocaleServiceModule } from '@koobiq/components/core';

@Component({
    imports: [KbqAutocompleteModule],
    template: `
        <input placeholder="Choose" [kbqAutocomplete]="auto" />

        <kbq-autocomplete #auto="kbqAutocomplete" (opened)="opened()" (closed)="closed()">
            @for (option of shown(); track option) {
                <kbq-option [value]="option">{{ option }}</kbq-option>
            }
        </kbq-autocomplete>
    `
})
class TestApp {
    readonly shown = signal(['One', 'Two']);
    readonly opened = vi.fn();
    readonly closed = vi.fn();
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
}

describe('triage: options running out while the panel is attached', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqLocaleServiceModule] });
    });

    afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

    it('DEFECT: opened and openedChange(true) fire again with no closed in between', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TestApp);
        const { shown, opened, closed, trigger } = fixture.componentInstance;

        fixture.detectChanges();

        const openedChanges: boolean[] = [];

        trigger().openedChange.subscribe((value) => openedChanges.push(value));

        trigger().open();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(trigger().panelOpen).toBe(true);
        expect(opened).toHaveBeenCalledTimes(1);

        shown.set([]);
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        // The panel is no longer open, yet nothing reports it closing.
        expect(trigger().panelOpen).toBe(false);
        expect(closed).not.toHaveBeenCalled();

        shown.set(['One', 'Two']);
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(trigger().panelOpen).toBe(true);
        expect(opened).toHaveBeenCalledTimes(2);
        expect(closed).not.toHaveBeenCalled();
        expect(openedChanges).toEqual([true, true]);

        trigger().closePanel();
        vi.useRealTimers();
    });
});
