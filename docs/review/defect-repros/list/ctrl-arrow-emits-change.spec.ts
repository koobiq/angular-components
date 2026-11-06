import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DOWN_ARROW } from '@koobiq/components/core';
import { KbqListModule, KbqListOption, KbqListSelection, KbqListSelectionChange } from '@koobiq/components/list';

@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection multiple="keyboard" [formControl]="control" (selectionChange)="changes.push($event)">
            <kbq-list-option [value]="'a'">a</kbq-list-option>
            <kbq-list-option [value]="'b'">b</kbq-list-option>
            <kbq-list-option [value]="'c'">c</kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly list = viewChild.required(KbqListSelection);
    readonly control = new FormControl<string[]>(['a']);
    readonly changes: KbqListSelectionChange[] = [];
}

describe('triage: Ctrl + arrow in KbqListSelection', () => {
    it('DEFECT: Ctrl + Down moves the active option without selecting it, yet emits selectionChange and reports the value', async () => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        // Attached, so that focus really moves between the options as the key manager activates them.
        document.body.appendChild(fixture.nativeElement);
        fixture.detectChanges();
        await fixture.whenStable();

        const { list, control, changes } = fixture.componentInstance;
        const options = fixture.debugElement
            .queryAll(By.directive(KbqListOption))
            .map(({ componentInstance }) => componentInstance as KbqListOption);
        const listElement = fixture.debugElement.query(By.directive(KbqListSelection)).nativeElement as HTMLElement;

        expect(options.map((option) => option.selected)).toEqual([true, false, false]);

        list().keyManager.setActiveItem(0);
        await fixture.whenStable();

        const valueChanges: unknown[] = [];

        control.valueChanges.subscribe((value) => valueChanges.push(value));

        listElement.dispatchEvent(
            new KeyboardEvent('keydown', { keyCode: DOWN_ARROW, ctrlKey: true, bubbles: true, cancelable: true })
        );

        // The active option moved and the selection did not change.
        expect(list().keyManager.activeItemIndex).toBe(1);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(options.map((option) => option.selected)).toEqual([true, false, false]);
        expect(control.value).toEqual(['a']);

        // Yet a selectionChange went out for the option that was merely activated...
        expect(changes.length).toBe(1);
        expect(changes[0].option).toBe(options[1]);
        expect(changes[0].option.selected).toBe(false);
        // ...and the unchanged value was pushed to the form control, which marks it dirty.
        expect(valueChanges).toEqual([['a']]);
        expect(control.dirty).toBe(true);

        fixture.nativeElement.remove();
    });
});
