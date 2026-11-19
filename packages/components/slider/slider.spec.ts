import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputSlider } from './input-slider';
import { KbqSlider } from './slider';
import type { KbqSliderValue } from './slider.types';

@Component({
    imports: [KbqSlider, KbqInputSlider, ReactiveFormsModule, FormsModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-label>Volume</kbq-label>
            <kbq-slider [formControl]="control" />
            <kbq-hint>Percent</kbq-hint>
            <kbq-error>At least 40</kbq-error>
        </kbq-form-field>
        <kbq-input-slider [(ngModel)]="value" />
    `
})
class TestForms {
    readonly control = new FormControl<KbqSliderValue>(35, { nonNullable: true, validators: Validators.min(40) });
    value: KbqSliderValue = [20, 80];
}

describe('KbqSlider', () => {
    let fixture: ComponentFixture<KbqSlider>;

    beforeEach(() => {
        fixture = TestBed.createComponent(KbqSlider);
        fixture.componentRef.setInput('aria-label', 'Volume');
        fixture.detectChanges();
    });

    const key = (input: HTMLInputElement, key: string, type = 'keydown'): void => {
        input.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));
    };

    it('emits one commit after a repeated keyboard interaction', () => {
        const commits = vi.fn();

        fixture.componentInstance.valueCommit.subscribe(commits);
        const input = fixture.nativeElement.querySelector('input');

        key(input, 'ArrowRight');
        key(input, 'ArrowRight');
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toBe(2);
        expect(commits).not.toHaveBeenCalled();
        key(input, 'ArrowRight', 'keyup');
        expect(commits).toHaveBeenCalledExactlyOnceWith({ value: 2, source: 'keyboard' });
    });

    it('rolls back keyboard edits on Escape without committing', () => {
        const commits = vi.fn();

        fixture.componentInstance.valueCommit.subscribe(commits);
        const input = fixture.nativeElement.querySelector('input');

        key(input, 'ArrowRight');
        key(input, 'Escape');
        key(input, 'ArrowRight', 'keyup');
        expect(fixture.componentInstance.value()).toBe(0);
        expect(commits).not.toHaveBeenCalled();
    });

    it('reports neighbour bounds, separate labels and stable thumb nodes', () => {
        fixture.componentRef.setInput('value', [20, 60]);
        fixture.componentRef.setInput('minDistance', 10);
        fixture.componentRef.setInput('thumbLabels', ['Minimum price', 'Maximum price']);
        fixture.detectChanges();
        const inputs: HTMLInputElement[] = [...fixture.nativeElement.querySelectorAll('input[type=range]')];

        expect(inputs.map((input) => [input.min, input.max, input.getAttribute('aria-label')])).toEqual([
            ['0', '50', 'Minimum price'],
            ['30', '100', 'Maximum price']
        ]);
        key(inputs[0], 'End');
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toEqual([50, 60]);
        expect(fixture.nativeElement.querySelector('input')).toBe(inputs[0]);
    });

    it('uses Home/End and navigates a discrete mark set', () => {
        fixture.componentRef.setInput('step', null);
        fixture.componentRef.setInput('marks', [{ value: 0 }, { value: 15 }, { value: 70 }]);
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input');

        key(input, 'ArrowRight');
        expect(fixture.componentInstance.value()).toBe(15);
        key(input, 'End');
        expect(fixture.componentInstance.value()).toBe(70);
        key(input, 'Home');
        expect(fixture.componentInstance.value()).toBe(0);
    });

    it('keeps read-only thumbs focusable and ignores native input events', () => {
        fixture.componentRef.setInput('readonly', true);
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input');

        input.focus();
        input.value = '50';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        key(input, 'End');
        expect(input.disabled).toBe(false);
        expect(input.value).toBe('0');
        expect(fixture.componentInstance.value()).toBe(0);
    });

    it('opens the tooltip on focus and dismisses it with Escape', async () => {
        fixture.componentRef.setInput('showTooltip', true);
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input');

        input.focus();
        await fixture.whenStable();
        expect(document.querySelector('.kbq-slider__tooltip')).not.toBeNull();
        key(input, 'Escape');
        await fixture.whenStable();
        await vi.waitFor(() => expect(document.querySelector('.kbq-slider__tooltip')).toBeNull());
    });

    it('advances native increment actions to the adjacent discrete stop', () => {
        fixture.componentRef.setInput('step', null);
        fixture.componentRef.setInput(
            'marks',
            [0, 3, 70, 100].map((value) => ({ value }))
        );
        fixture.componentRef.setInput('value', 3);
        fixture.detectChanges();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        input.value = '4';
        input.dispatchEvent(new Event('input'));
        expect(fixture.componentInstance.value()).toBe(70);
        expect(input.value).toBe('70');
    });

    it('normalizes display without committing a programmatic form write', () => {
        const commits = vi.fn();

        fixture.componentInstance.valueCommit.subscribe(commits);
        const changes = vi.fn();

        fixture.componentInstance.valueChange.subscribe(changes);
        fixture.componentInstance.writeValue(200);
        expect(changes).not.toHaveBeenCalled();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('input').value).toBe('100');
        expect(commits).not.toHaveBeenCalled();
    });

    it('has no accessibility violations for single, range and read-only states', async () => {
        await expect(fixture.nativeElement).toHaveNoViolations();
        fixture.componentRef.setInput('value', [20, 80]);
        fixture.componentRef.setInput('readonly', true);
        fixture.detectChanges();
        await expect(fixture.nativeElement).toHaveNoViolations();
    });
});

describe('Slider forms', () => {
    it('supports reactive writes, touched/dirty, reset and disabled', async () => {
        const fixture = TestBed.createComponent(TestForms);

        fixture.detectChanges();
        await fixture.whenStable();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('kbq-slider input');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: 'End', bubbles: true }));
        fixture.detectChanges();
        expect(fixture.componentInstance.control.value).toBe(100);
        expect(fixture.componentInstance.control.dirty).toBe(true);
        expect(fixture.componentInstance.control.touched).toBe(true);
        fixture.componentInstance.control.reset();
        fixture.detectChanges();
        expect(input.value).toBe('35');
        fixture.componentInstance.control.disable();
        fixture.detectChanges();
        expect(input.disabled).toBe(true);
    });

    it('links a form label, hint and validation error to the thumb', async () => {
        const fixture = TestBed.createComponent(TestForms);

        fixture.componentInstance.control.markAsTouched();
        fixture.detectChanges();
        await fixture.whenStable();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('kbq-slider input');
        const label = fixture.nativeElement.querySelector('.kbq-form-field__label');

        expect(input.getAttribute('aria-labelledby')).toBe(label.id);
        expect(input.getAttribute('aria-invalid')).toBe('true');
        const ids = input.getAttribute('aria-describedby')!.split(' ');

        expect(ids).toContain(fixture.nativeElement.querySelector('kbq-hint').id);
        expect(ids).toContain(fixture.nativeElement.querySelector('kbq-error').id);
        await expect(fixture.nativeElement).toHaveNoViolations();
    });

    it('keeps an external write silent while a numeric field has an unfinished draft', async () => {
        const fixture = TestBed.createComponent(KbqInputSlider);
        const changes = vi.fn();
        const commits = vi.fn();

        fixture.componentInstance.valueChange.subscribe(changes);
        fixture.componentInstance.valueCommit.subscribe(commits);
        fixture.detectChanges();
        await fixture.whenStable();
        const editor: HTMLInputElement = fixture.nativeElement.querySelector('input.kbq-input');

        editor.focus();
        editor.value = '58';
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.componentInstance.writeValue(42);
        await new Promise((resolve) => setTimeout(resolve));
        fixture.detectChanges();
        editor.blur();
        expect(editor.value).toBe('42');
        expect(fixture.componentInstance.value()).toBe(42);
        expect(changes).not.toHaveBeenCalled();
        expect(commits).not.toHaveBeenCalled();
    });

    it('synchronizes numeric drafts with a range without erasing an empty edit', async () => {
        const fixture = TestBed.createComponent(TestForms);

        fixture.detectChanges();
        await fixture.whenStable();
        const hybrid = fixture.debugElement.query(By.directive(KbqInputSlider));
        const input: HTMLInputElement = hybrid.nativeElement.querySelector('input.kbq-input');

        input.dispatchEvent(new FocusEvent('focus'));
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(input.value).toBe('');
        expect(fixture.componentInstance.value).toEqual([20, 80]);
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(input.value).toBe('20');
    });
});
