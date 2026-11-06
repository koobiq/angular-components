import { Component, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqButtonToggle, KbqButtonToggleGroup, KbqButtonToggleModule } from '@koobiq/components/button-toggle';

@Component({
    imports: [KbqButtonToggleModule],
    template: `
        <kbq-button-toggle-group [multiple]="multiple">
            <kbq-button-toggle [value]="'a'">A</kbq-button-toggle>
            <kbq-button-toggle [value]="'b'">B</kbq-button-toggle>
            <kbq-button-toggle [value]="'c'">C</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class SwitchingGroup {
    readonly group = viewChild.required(KbqButtonToggleGroup);
    readonly toggles = viewChildren(KbqButtonToggle);
    multiple = true;
}

describe('triage: button-toggle multiple switched at runtime', () => {
    const setup = (multiple: boolean) => {
        TestBed.configureTestingModule({ imports: [SwitchingGroup] });

        const fixture = TestBed.createComponent(SwitchingGroup);

        fixture.componentInstance.multiple = multiple;
        fixture.detectChanges();

        const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));

        return { fixture, buttons };
    };

    it('DEFECT: a group switched from multiple to single keeps several radios checked and reports the first', () => {
        const { fixture, buttons } = setup(true);
        const host = fixture.componentInstance;

        buttons[0].click();
        fixture.detectChanges();
        buttons[1].click();
        fixture.detectChanges();

        host.multiple = false;
        fixture.detectChanges();

        // The roles follow the new mode...
        expect(host.toggles().map((toggle) => toggle.type)).toEqual(['radio', 'radio', 'radio']);

        // ...but the selection model is still the multiple one created in ngOnInit.
        expect(host.toggles().map((toggle) => toggle.checked)).toEqual([true, true, false]);

        const changes: unknown[] = [];

        host.group().change.subscribe((event) => changes.push(event.value));

        buttons[2].click();
        fixture.detectChanges();

        // Clicking a third radio adds it instead of replacing the selection.
        expect(host.toggles().map((toggle) => toggle.checked)).toEqual([true, true, true]);
        expect(buttons.map((button) => button.getAttribute('aria-checked'))).toEqual(['true', 'true', 'true']);
        // The group keeps reporting the toggle selected first, not the one the user just picked.
        expect(host.group().value).toBe('a');
        expect(changes).toEqual(['a']);
    });

    it('DEFECT: a group switched from single to multiple still deselects the previous toggle', () => {
        const { fixture, buttons } = setup(false);
        const host = fixture.componentInstance;

        buttons[0].click();
        fixture.detectChanges();

        host.multiple = true;
        fixture.detectChanges();

        expect(host.toggles().map((toggle) => toggle.type)).toEqual(['checkbox', 'checkbox', 'checkbox']);

        buttons[1].click();
        fixture.detectChanges();

        expect(host.toggles().map((toggle) => toggle.checked)).toEqual([false, true, false]);
        expect(host.group().value).toEqual(['b']);
    });
});
