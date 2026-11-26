import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import {
    FormControl,
    FormGroup,
    FormGroupDirective,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    type ErrorStateMatcher,
    kbqErrorStateMatcherProvider,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputSlider } from './input-slider';
import { KbqSlider } from './slider';
import type { KbqSliderValue } from './slider.types';

@Component({
    imports: [KbqSlider, KbqInputSlider, ReactiveFormsModule, FormsModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-label>Volume</kbq-label>
            <kbq-slider id="" [formControl]="control" />
            <kbq-hint>Percent</kbq-hint>
            <kbq-error>At least 40</kbq-error>
        </kbq-form-field>
        <kbq-input-slider [(ngModel)]="value" />
    `
})
class TestForms {
    readonly control = new FormControl<KbqSliderValue>(35, {
        nonNullable: true,
        validators: Validators.min(40),
        updateOn: 'blur'
    });
    value: KbqSliderValue = [20, 80];
}

@Component({
    imports: [KbqSlider, KbqInputSlider, ReactiveFormsModule, KbqFormFieldModule],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                @if (withEditor) {
                    <kbq-input-slider formControlName="volume" [errorStateMatcher]="matcher()" />
                } @else {
                    <kbq-slider formControlName="volume" [errorStateMatcher]="matcher()" />
                }
                <kbq-error>At least 40</kbq-error>
            </kbq-form-field>
            <button type="submit">Submit</button>
        </form>
    `
})
class SliderWithErrorStateMatcher {
    withEditor = false;
    readonly matcher = signal<ErrorStateMatcher | undefined>(undefined);
    readonly form = new FormGroup({
        volume: new FormControl(35, { nonNullable: true, validators: Validators.min(40) })
    });
}

describe('KbqSlider', () => {
    describe('slider behavior', () => {
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

        it('swaps a range across its minimum gap with one arrow step in either direction', () => {
            fixture.componentRef.setInput('value', [25, 35]);
            fixture.componentRef.setInput('collision', 'swap');
            fixture.componentRef.setInput('minDistance', 10);
            fixture.detectChanges();
            const [lower, upper] = fixture.nativeElement.querySelectorAll('input[type=range]');

            lower.focus();
            key(lower, 'ArrowRight');
            expect(fixture.componentInstance.value()).toEqual([35, 45]);
            expect(document.activeElement).toBe(upper);
            key(upper, 'ArrowLeft');
            expect(fixture.componentInstance.value()).toEqual([25, 35]);
            expect(document.activeElement).toBe(lower);
        });

        it('uses a numeric step supplied as a text attribute', () => {
            fixture.componentRef.setInput('step', '5');
            fixture.detectChanges();
            key(fixture.nativeElement.querySelector('input'), 'ArrowRight');
            expect(fixture.componentInstance.value()).toBe(5);
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

        it.each([
            { fill: 'start', value: 50, filled: ['20'] },
            { fill: 'end', value: 50, filled: ['80'] },
            { fill: 'start', value: [30, 70], filled: ['50'] },
            { fill: 'outside', value: [30, 70], filled: ['20', '80'] },
            { fill: 'origin', value: 75, filled: ['50'] },
            { fill: 'none', value: 50, filled: [] }
        ])('marks only the ticks inside the $fill fill for $value', ({ fill, value, filled }) => {
            fixture.componentRef.setInput(
                'marks',
                [20, 50, 80].map((value) => ({ value }))
            );
            fixture.componentRef.setInput('fill', fill);
            fixture.componentRef.setInput('fillOrigin', 25);
            fixture.componentRef.setInput('value', value);
            fixture.detectChanges();

            const ticks: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.kbq-slider__tick_filled');

            expect(Array.from(ticks, (tick) => tick.parentElement?.dataset['markValue'])).toEqual(filled);
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

        it('uses the disabled input until the form supplies its own state', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();
            expect(fixture.componentInstance.disabled()).toBe(true);
            fixture.componentInstance.setDisabledState(false);
            expect(fixture.componentInstance.disabled()).toBe(false);
            fixture.componentInstance.setDisabledState(true);
            expect(fixture.componentInstance.disabled()).toBe(true);
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

    describe('forms', () => {
        it('uses the parent NgForm to show and clear submission errors for both sliders', async () => {
            @Component({
                imports: [FormsModule, KbqFormFieldModule, KbqSlider, KbqInputSlider],
                template: `
                    <form>
                        <kbq-form-field>
                            <kbq-slider name="volume" required [ngModel]="null" [errorStateMatcher]="matcher" />
                            <kbq-error>Choose a volume</kbq-error>
                        </kbq-form-field>
                        <kbq-form-field>
                            <kbq-input-slider name="balance" required [ngModel]="null" [errorStateMatcher]="matcher" />
                            <kbq-error>Choose a balance</kbq-error>
                        </kbq-form-field>
                        <button type="submit">Submit</button>
                    </form>
                `
            })
            class TemplateDrivenSliders {
                readonly matcher = new ShowOnFormSubmitErrorStateMatcher();
            }

            const fixture = TestBed.createComponent(TemplateDrivenSliders);

            await fixture.whenStable();
            const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
            const errors = () => Array.from(form.querySelectorAll('kbq-error'), (error) => error.textContent);

            expect(errors()).toEqual([]);
            form.requestSubmit();
            await fixture.whenStable();
            expect(errors()).toEqual(['Choose a volume', 'Choose a balance']);
            form.reset();
            await fixture.whenStable();
            expect(errors()).toEqual([]);
        });

        it('supports reactive writes, touched/dirty, reset and disabled', async () => {
            const fixture = TestBed.createComponent(TestForms);

            fixture.detectChanges();
            await fixture.whenStable();
            const input: HTMLInputElement = fixture.nativeElement.querySelector('kbq-slider input');

            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keyup', { key: 'End', bubbles: true }));
            fixture.detectChanges();
            expect(input.value).toBe('100');
            expect(fixture.componentInstance.control.value).toBe(35);
            expect(fixture.componentInstance.control.touched).toBe(false);

            input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
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
            fixture.componentInstance.control.enable();
            fixture.detectChanges();
            expect(input.disabled).toBe(false);
        });

        it('links a form label, hint and validation error to the thumb', async () => {
            const fixture = TestBed.createComponent(TestForms);

            fixture.componentInstance.control.markAsTouched();
            fixture.detectChanges();
            await fixture.whenStable();
            const input: HTMLInputElement = fixture.nativeElement.querySelector('kbq-slider input');
            const label = fixture.nativeElement.querySelector('.kbq-form-field__label');

            expect(label.id).toMatch(/^kbq-slider-.+-label$/);
            expect(input.getAttribute('aria-labelledby')).toBe(label.id);
            expect(input.getAttribute('aria-invalid')).toBe('true');
            const ids = input.getAttribute('aria-describedby')!.split(' ');

            expect(ids).toContain(fixture.nativeElement.querySelector('kbq-hint').id);
            expect(ids).toContain(fixture.nativeElement.querySelector('kbq-error').id);
            await expect(fixture.nativeElement).toHaveNoViolations();
        });

        it('applies per-instance accessible labels to both parts of the input slider', async () => {
            @Component({
                imports: [KbqInputSlider],
                template: `
                    <kbq-input-slider
                        [value]="[20, 30]"
                        [localeOverrides]="{ a11y: { sliderStart: 'Budget floor' } }"
                    />
                `
            })
            class LocalizedSlider {}

            const fixture = TestBed.createComponent(LocalizedSlider);

            fixture.detectChanges();
            await fixture.whenStable();
            const editors = fixture.nativeElement.querySelectorAll('input.kbq-input');
            const thumbs = fixture.nativeElement.querySelectorAll('input[type=range]');

            expect(editors[0].getAttribute('aria-label')).toBe('Budget floor');
            expect(thumbs[0].getAttribute('aria-label')).toBe('Budget floor');
        });

        it('calculates every push draft from the range at the start of editing', async () => {
            const fixture = TestBed.createComponent(KbqInputSlider);

            fixture.componentRef.setInput('value', [20, 60]);
            fixture.componentRef.setInput('collision', 'push');
            fixture.detectChanges();
            await fixture.whenStable();
            const editor: HTMLInputElement = fixture.nativeElement.querySelectorAll('input.kbq-input')[1];

            editor.focus();
            expect(document.activeElement).toBe(editor);

            for (const digit of ['1', '15']) {
                editor.value = digit;
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                await vi.waitFor(() =>
                    expect(fixture.componentInstance.value()).toEqual([Number(digit), Number(digit)])
                );
            }

            editor.blur();
            expect(fixture.componentInstance.value()).toEqual([15, 15]);
        });

        it('consumes Escape only while the numeric editor has a draft', async () => {
            const fixture = TestBed.createComponent(KbqInputSlider);

            fixture.detectChanges();
            await fixture.whenStable();
            const editor: HTMLInputElement = fixture.nativeElement.querySelector('input.kbq-input');
            const escape = () =>
                editor.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true, cancelable: true })
                );

            editor.focus();
            expect(escape()).toBe(true);
            editor.value = '8';
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            expect(escape()).toBe(false);
            expect(editor.value).toBe('0');
            expect(escape()).toBe(true);
        });

        it('keeps subsequent fractional text while the editor stays focused after a form write', async () => {
            const fixture = TestBed.createComponent(KbqInputSlider);

            fixture.detectChanges();
            await fixture.whenStable();
            const editor: HTMLInputElement = fixture.nativeElement.querySelector('input.kbq-input');

            editor.focus();
            expect(document.activeElement).toBe(editor);
            fixture.componentInstance.writeValue(10);
            fixture.detectChanges();
            await fixture.whenStable();

            editor.value = '2,5';
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            await vi.waitFor(() => expect(fixture.componentInstance.value()).toBe(3));
            fixture.detectChanges();
            await fixture.whenStable();
            expect(editor.value).toBe('2,5');
            editor.blur();
            expect(editor.value).toBe('3');
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
            expect(document.activeElement).toBe(editor);
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

        it('keeps the external binding when an old draft loses focus', async () => {
            const fixture = TestBed.createComponent(KbqInputSlider);

            fixture.componentRef.setInput('value', 70);
            fixture.detectChanges();
            await fixture.whenStable();
            const editor: HTMLInputElement = fixture.nativeElement.querySelector('input.kbq-input');
            const commits = vi.fn();

            fixture.componentInstance.valueCommit.subscribe(commits);
            editor.focus();
            expect(document.activeElement).toBe(editor);
            editor.value = '58';
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            await vi.waitFor(() => expect(fixture.componentInstance.value()).toBe(58));

            fixture.componentRef.setInput('value', 42);
            fixture.detectChanges();
            editor.blur();

            expect(editor.value).toBe('42');
            expect(fixture.componentInstance.value()).toBe(42);
            expect(commits).not.toHaveBeenCalled();
        });

        it('synchronizes numeric drafts with a range without erasing an empty edit', async () => {
            const fixture = TestBed.createComponent(TestForms);

            fixture.detectChanges();
            await fixture.whenStable();
            const hybrid = fixture.debugElement.query(By.directive(KbqInputSlider));
            const input: HTMLInputElement = hybrid.nativeElement.querySelector('input.kbq-input');

            await vi.waitFor(() => expect(input.value).toBe('20'));
            input.focus();
            expect(document.activeElement).toBe(input);
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await vi.waitFor(() => {
                fixture.detectChanges();
                expect(input.value).toBe('');
            });
            expect(fixture.componentInstance.value).toEqual([20, 80]);
            input.blur();
            fixture.detectChanges();
            expect(input.value).toBe('20');
        });
    });

    describe.each(['slider', 'input-slider'] as const)('%s ErrorStateMatcher', (kind) => {
        const setup = async (matcher?: ErrorStateMatcher) => {
            const fixture = TestBed.createComponent(SliderWithErrorStateMatcher);
            const host = fixture.componentInstance;

            host.withEditor = kind === 'input-slider';
            host.matcher.set(matcher);
            await fixture.whenStable();

            const field = fixture.debugElement.query(By.directive(KbqFormField));
            const root: HTMLElement = field.nativeElement;
            const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[type=range], input.kbq-input'));
            const expectError = (shown: boolean) => {
                expect(field.injector.get(KbqFormField).control().errorState()).toBe(shown);
                expect(root.classList.contains('kbq-form-field_invalid')).toBe(shown);
                const error = root.querySelector('kbq-error');

                expect(error?.textContent).toBe(shown ? 'At least 40' : undefined);

                for (const input of inputs) {
                    expect(input.getAttribute('aria-invalid') === 'true').toBe(shown);
                    expect(input.getAttribute('aria-describedby')?.split(' ') ?? []).toEqual(error ? [error.id] : []);
                }
            };

            return {
                fixture,
                host,
                inputs,
                expectError,
                form: fixture.debugElement.query(By.directive(FormGroupDirective))
            };
        };

        it('shows the default error when focus leaves the control and clears it when valid', async () => {
            const { fixture, host, inputs, expectError } = await setup();

            expect(inputs).toHaveLength(kind === 'input-slider' ? 2 : 1);
            expectError(false);

            for (const input of inputs) {
                input.focus();
                await fixture.whenStable();
                expect(host.form.controls.volume.untouched).toBe(true);
                expectError(false);
            }

            inputs[inputs.length - 1].blur();
            await fixture.whenStable();
            expect(host.form.controls.volume.touched).toBe(true);
            expectError(true);

            host.form.controls.volume.setValue(45);
            await fixture.whenStable();
            expectError(false);
        });

        it.each([
            { name: 'default', matcher: undefined },
            { name: 'submit-only', matcher: new ShowOnFormSubmitErrorStateMatcher() }
        ])('shows the $name error on submit and clears it on reset', async ({ matcher }) => {
            const { fixture, host, form, expectError } = await setup(matcher);

            expectError(false);
            form.nativeElement.querySelector('button[type=submit]').click();
            await fixture.whenStable();
            expect(host.form.controls.volume.untouched).toBe(true);
            expectError(true);
            form.nativeElement.reset();
            await fixture.whenStable();
            expectError(false);
        });

        it('keeps a submit-only error hidden after blur', async () => {
            const { fixture, host, inputs, expectError } = await setup(new ShowOnFormSubmitErrorStateMatcher());

            inputs[0].focus();
            inputs[0].blur();
            await fixture.whenStable();
            expect(host.form.controls.volume.touched).toBe(true);
            expectError(false);
        });

        it('shows a dirty error after an edit but keeps it hidden after blur alone', async () => {
            const { fixture, host, inputs, expectError } = await setup(new ShowOnControlDirtyErrorStateMatcher());
            const thumb: HTMLInputElement = fixture.nativeElement.querySelector('input[type=range]');

            inputs[0].focus();
            inputs[0].blur();
            await fixture.whenStable();
            expectError(false);
            thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            await fixture.whenStable();
            expect(host.form.controls.volume.dirty).toBe(true);
            expectError(true);
        });

        it('passes the outer control and form to the provided matcher and lets the input override it', async () => {
            const provided: ErrorStateMatcher = { isErrorState: (control) => !!control?.untouched };
            const isErrorState = vi.spyOn(provided, 'isErrorState');

            TestBed.configureTestingModule({ providers: [kbqErrorStateMatcherProvider(provided)] });
            const { fixture, host, form, expectError } = await setup();

            expect(isErrorState).toHaveBeenCalledWith(host.form.controls.volume, form.injector.get(FormGroupDirective));
            expectError(true);
            host.matcher.set({ isErrorState: (control) => !!control?.valid });
            await fixture.whenStable();
            expectError(false);
            host.form.controls.volume.setValue(45);
            await fixture.whenStable();
            expectError(true);
            host.form.controls.volume.setValue(35);
            await fixture.whenStable();
            expectError(false);
            host.matcher.set(undefined);
            await fixture.whenStable();
            expectError(true);
        });
    });
});
