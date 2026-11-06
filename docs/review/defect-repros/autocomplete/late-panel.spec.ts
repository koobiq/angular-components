import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqAutocomplete, KbqAutocompleteModule, KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import { dispatchKeyboardEvent, DOWN_ARROW, KbqLocaleServiceModule } from '@koobiq/components/core';

@Component({
    imports: [KbqAutocompleteModule],
    template: `
        <input placeholder="Eager" [kbqAutocomplete]="eagerAuto" />

        <kbq-autocomplete #eagerAuto="kbqAutocomplete">
            <kbq-option value="One">One</kbq-option>
            <kbq-option value="Two">Two</kbq-option>
        </kbq-autocomplete>
    `
})
class EagerPanelApp {
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly autocomplete = viewChild.required(KbqAutocomplete);
}

@Component({
    imports: [KbqAutocompleteModule],
    template: `
        <input placeholder="Late" [kbqAutocomplete]="autocomplete()!" />

        @if (panelShown()) {
            <kbq-autocomplete>
                <kbq-option value="One">One</kbq-option>
                <kbq-option value="Two">Two</kbq-option>
            </kbq-autocomplete>
        }
    `
})
class LatePanelApp {
    readonly panelShown = signal(false);
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly autocomplete = viewChild(KbqAutocomplete);
}

describe('triage: panel bound after the trigger first rendered', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqLocaleServiceModule] });
    });

    afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

    it('control: with the panel bound from the start, an arrow key scrolls the active option into view', async () => {
        const fixture = TestBed.createComponent(EagerPanelApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const trigger = fixture.componentInstance.trigger();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        trigger.open();
        fixture.detectChanges();
        await fixture.whenStable();

        const scroll = vi.spyOn(trigger, 'scrollActiveOptionIntoView');

        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        expect(trigger.activeOption).toBe(fixture.componentInstance.autocomplete().options.get(1));
        expect(scroll).toHaveBeenCalledTimes(1);
    });

    it('DEFECT: with the panel bound later, an arrow key moves the active option but never scrolls it into view', async () => {
        const fixture = TestBed.createComponent(LatePanelApp);

        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentInstance.panelShown.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        const trigger = fixture.componentInstance.trigger();
        const autocomplete = fixture.componentInstance.autocomplete()!;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        expect(trigger.autocomplete()).toBe(autocomplete);

        trigger.open();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(trigger.panelOpen).toBe(true);

        const scroll = vi.spyOn(trigger, 'scrollActiveOptionIntoView');

        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        expect(trigger.activeOption).toBe(autocomplete.options.get(1));
        expect(scroll).not.toHaveBeenCalled();

        // Closed before teardown: the panel inside `@if` is destroyed before the trigger, whose `ngOnDestroy` would
        // otherwise emit `closed` on a destroyed output (NG0953 warning).
        trigger.closePanel();
    });
});
