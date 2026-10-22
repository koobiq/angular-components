import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SPACE } from '@koobiq/components/core';
import { KbqListModule, KbqListOption, KbqListSelection } from '@koobiq/components/list';

// The combination the `list-action-button` docs example uses: single selection, `[autoSelect]="false"`.
@Component({
    imports: [KbqListModule, ReactiveFormsModule],
    template: `
        <kbq-list-selection [autoSelect]="false" [formControl]="control">
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
}

describe('triage: noUnselectLast with autoSelect off', () => {
    it('DEFECT: a plain click deselects the only selected option although Space and Ctrl + click refuse to', async () => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const { list, control } = fixture.componentInstance;
        const options = fixture.debugElement
            .queryAll(By.directive(KbqListOption))
            .map(({ componentInstance }) => componentInstance as KbqListOption);
        const listElement = fixture.debugElement.query(By.directive(KbqListSelection)).nativeElement as HTMLElement;

        expect(list().multiple).toBe(false);
        expect(list().autoSelect).toBe(false);
        expect(list().noUnselectLast).toBe(true);
        expect(options[0].selected).toBe(true);

        // Space on the only selected option: refused by the guard.
        list().keyManager.setActiveItem(0);
        listElement.dispatchEvent(new KeyboardEvent('keydown', { keyCode: SPACE, bubbles: true, cancelable: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(options[0].selected).toBe(true);

        // Ctrl + click on it: refused too.
        options[0]
            .getHostElement()
            .dispatchEvent(new MouseEvent('click', { ctrlKey: true, bubbles: true, cancelable: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(options[0].selected).toBe(true);
        expect(control.value).toEqual(['a']);

        // A plain click on it: deselects the last selected option.
        options[0].getHostElement().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(options[0].selected).toBe(false);
        expect(list().selectionModel.selected.length).toBe(0);
        expect(control.value).toEqual([]);
    });
});
