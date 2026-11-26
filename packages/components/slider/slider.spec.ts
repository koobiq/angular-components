import { FocusMonitor } from '@angular/cdk/a11y';
import { END, ESCAPE, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW } from '@angular/cdk/keycodes';
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
    dispatchKeyboardEvent,
    type ErrorStateMatcher,
    kbqErrorStateMatcherProvider,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputSlider } from './input-slider';
import { KbqSlider } from './slider';
import type { KbqSliderValue } from './slider.types';
import { kbqSliderOptionsProvider } from './slider-options';

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
    describe('kbqSliderOptionsProvider', () => {
        it('applies partial defaults and gives explicit slider inputs precedence', () => {
            TestBed.configureTestingModule({
                providers: [
                    kbqSliderOptionsProvider({
                        step: null,
                        marks: [{ value: 10 }, { value: 50 }],
                        thumbAlignment: 'center',
                        showTooltip: true
                    })
                ]
            });
            const fixture = TestBed.createComponent(KbqSlider);
            const slider = fixture.componentInstance;

            fixture.detectChanges();
            expect(slider.max()).toBe(100);
            expect(slider.step()).toBeNull();
            expect(slider.value()).toBe(10);
            expect(slider.thumbAlignment()).toBe('center');
            expect(slider.showTooltip()).toBe(true);

            fixture.componentRef.setInput('step', '2');
            fixture.componentRef.setInput('showTooltip', false);
            fixture.detectChanges();
            expect(slider.step()).toBe(2);
            expect(slider.value()).toBe(0);
            expect(slider.showTooltip()).toBe(false);
        });

        it('inherits application defaults and scopes overrides to the input slider subtree', async () => {
            @Component({
                imports: [KbqInputSlider],
                template: `
                    <kbq-input-slider [value]="20" />
                `,
                providers: [kbqSliderOptionsProvider({ unit: 'kg', showStepper: false })]
            })
            class LocalSliderOptions {}

            TestBed.configureTestingModule({
                providers: [kbqSliderOptionsProvider({ step: 5, vertical: true, unit: 'g' })]
            });
            const local = TestBed.createComponent(LocalSliderOptions);
            const sibling = TestBed.createComponent(KbqInputSlider);

            await local.whenStable();
            const inputSlider = local.debugElement.query(By.directive(KbqInputSlider)).injector.get(KbqInputSlider);
            const track = local.debugElement.query(By.directive(KbqSlider)).injector.get(KbqSlider);

            expect(inputSlider.step()).toBe(5);
            expect(track.step()).toBe(5);
            expect(track.vertical()).toBe(false);
            expect(local.nativeElement.querySelector('[kbqSuffix]').textContent.trim()).toBe('kg');
            expect(local.nativeElement.querySelector('kbq-stepper')).toBeNull();
            expect(local.nativeElement.querySelector('input[type=range]').getAttribute('aria-valuetext')).toBe('20 kg');
            expect(sibling.componentInstance.unit()).toBe('g');
            expect(sibling.componentInstance.showStepper()).toBe(true);
            expect(TestBed.createComponent(KbqSlider).componentInstance.vertical()).toBe(true);
        });

        it('uses input slider bindings for both the editor and the thumb', async () => {
            TestBed.configureTestingModule({
                providers: [kbqSliderOptionsProvider({ step: 5, unit: 'kg', showStepper: true })]
            });
            const fixture = TestBed.createComponent(KbqInputSlider);

            fixture.componentRef.setInput('step', 2);
            fixture.componentRef.setInput('value', 6);
            fixture.componentRef.setInput('unit', 'g');
            fixture.componentRef.setInput('showStepper', false);
            await fixture.whenStable();

            const thumb: HTMLInputElement = fixture.nativeElement.querySelector('input[type=range]');
            const editor: HTMLInputElement = fixture.nativeElement.querySelector('input.kbq-input');

            expect(editor.value).toBe('6');
            expect(thumb.value).toBe('6');
            expect(thumb.step).toBe('2');
            expect(thumb.getAttribute('aria-valuetext')).toBe('6 g');
            expect(fixture.nativeElement.querySelector('kbq-stepper')).toBeNull();
        });
    });

    describe('slider behavior', () => {
        let fixture: ComponentFixture<KbqSlider>;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqSlider);
            fixture.componentRef.setInput('aria-label', 'Volume');
            fixture.detectChanges();
        });

        it('emits one commit after a repeated keyboard interaction', () => {
            const commits = vi.fn();

            fixture.componentInstance.valueCommit.subscribe(commits);
            const input = fixture.nativeElement.querySelector('input');

            dispatchKeyboardEvent(input, 'keydown', RIGHT_ARROW);
            dispatchKeyboardEvent(input, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(fixture.componentInstance.value()).toBe(2);
            expect(commits).not.toHaveBeenCalled();
            dispatchKeyboardEvent(input, 'keyup', RIGHT_ARROW);
            expect(commits).toHaveBeenCalledExactlyOnceWith({ value: 2, source: 'keyboard' });
        });

        it('rolls back keyboard edits on Escape without committing', () => {
            const commits = vi.fn();

            fixture.componentInstance.valueCommit.subscribe(commits);
            const input = fixture.nativeElement.querySelector('input');

            dispatchKeyboardEvent(input, 'keydown', RIGHT_ARROW);
            dispatchKeyboardEvent(input, 'keydown', ESCAPE);
            dispatchKeyboardEvent(input, 'keyup', RIGHT_ARROW);
            expect(fixture.componentInstance.value()).toBe(0);
            expect(commits).not.toHaveBeenCalled();
        });

        it('reports neighbour bounds, separate labels and stable thumb nodes', () => {
            fixture.componentRef.setInput('value', [20, 60]);
            fixture.componentRef.setInput('minDistance', 10);
            fixture.componentRef.setInput('thumbAriaLabels', ['Minimum price', 'Maximum price']);
            fixture.detectChanges();
            const inputs: HTMLInputElement[] = [...fixture.nativeElement.querySelectorAll('input[type=range]')];

            expect(inputs.map((input) => [input.min, input.max, input.getAttribute('aria-label')])).toEqual([
                ['0', '50', 'Minimum price'],
                ['30', '100', 'Maximum price']
            ]);
            dispatchKeyboardEvent(inputs[0], 'keydown', END);
            fixture.detectChanges();
            expect(fixture.componentInstance.value()).toEqual([50, 60]);
            expect(fixture.nativeElement.querySelector('input')).toBe(inputs[0]);
        });

        it('swaps a range across its minimum gap with one arrow step in either direction', () => {
            const focusVia = vi.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

            fixture.componentRef.setInput('value', [25, 35]);
            fixture.componentRef.setInput('thumbCollisionBehavior', 'swap');
            fixture.componentRef.setInput('minDistance', 10);
            fixture.detectChanges();
            const [lower, upper] = fixture.nativeElement.querySelectorAll('input[type=range]');

            lower.focus();
            dispatchKeyboardEvent(lower, 'keydown', RIGHT_ARROW);
            expect(fixture.componentInstance.value()).toEqual([35, 45]);
            expect(document.activeElement).toBe(upper);
            expect(focusVia).toHaveBeenCalledWith(expect.objectContaining({ nativeElement: upper }), 'keyboard', {
                preventScroll: true
            });
            dispatchKeyboardEvent(upper, 'keydown', LEFT_ARROW);
            expect(fixture.componentInstance.value()).toEqual([25, 35]);
            expect(document.activeElement).toBe(lower);
        });

        it('uses a numeric step supplied as a text attribute', () => {
            fixture.componentRef.setInput('step', '5');
            fixture.detectChanges();
            dispatchKeyboardEvent(fixture.nativeElement.querySelector('input'), 'keydown', RIGHT_ARROW);
            expect(fixture.componentInstance.value()).toBe(5);
        });

        it('moves by the configured page step in both directions', () => {
            fixture.componentRef.setInput('step', 2);
            fixture.componentRef.setInput('largeStepMultiplier', 3);
            fixture.detectChanges();
            const input = fixture.nativeElement.querySelector('input');

            dispatchKeyboardEvent(input, 'keydown', PAGE_UP);
            expect(fixture.componentInstance.value()).toBe(6);
            dispatchKeyboardEvent(input, 'keyup', PAGE_UP);
            dispatchKeyboardEvent(input, 'keydown', PAGE_DOWN);
            expect(fixture.componentInstance.value()).toBe(0);
        });

        it('skips mark animation when reduced motion is enabled after the slider renders', () => {
            fixture.componentRef.setInput('marks', [
                { value: 25, label: '25' },
                { value: 50, label: '50' }
            ]);
            fixture.detectChanges();
            const rail: HTMLElement = fixture.nativeElement.querySelector('.kbq-slider__rail');
            const thumb: HTMLElement = fixture.nativeElement.querySelector('.kbq-slider__thumb');
            const [first, second] = rail.querySelectorAll<HTMLElement>('.kbq-slider__mark-label');
            const measureThumb = vi.spyOn(thumb, 'getBoundingClientRect');

            rail.animate = vi.fn();
            first.click();
            fixture.detectChanges();
            expect(measureThumb).toHaveBeenCalled();
            measureThumb.mockClear();

            vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(prefers-reduced-motion: reduce)' }));

            try {
                second.click();
                fixture.detectChanges();
                expect(fixture.componentInstance.value()).toBe(50);
                expect(measureThumb).not.toHaveBeenCalled();
            } finally {
                vi.unstubAllGlobals();
            }
        });

        it('uses Home/End and navigates a discrete mark set', () => {
            fixture.componentRef.setInput('step', null);
            fixture.componentRef.setInput('marks', [{ value: 0 }, { value: 15 }, { value: 70 }]);
            fixture.detectChanges();
            const input = fixture.nativeElement.querySelector('input');

            dispatchKeyboardEvent(input, 'keydown', RIGHT_ARROW);
            expect(fixture.componentInstance.value()).toBe(15);
            dispatchKeyboardEvent(input, 'keydown', END);
            expect(fixture.componentInstance.value()).toBe(70);
            dispatchKeyboardEvent(input, 'keydown', HOME);
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
            dispatchKeyboardEvent(input, 'keydown', END);
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
            dispatchKeyboardEvent(input, 'keydown', ESCAPE);
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

            input.focus();
            dispatchKeyboardEvent(input, 'keydown', END);
            dispatchKeyboardEvent(input, 'keyup', END);
            fixture.detectChanges();
            expect(input.value).toBe('100');
            expect(fixture.componentInstance.control.value).toBe(35);
            expect(fixture.componentInstance.control.touched).toBe(false);

            input.blur();
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

        it('flushes a crossing draft once when focus leaves an updateOn blur input slider', async () => {
            @Component({
                imports: [ReactiveFormsModule, KbqInputSlider],
                template: `
                    <kbq-input-slider thumbCollisionBehavior="swap" [formControl]="control" />
                `
            })
            class RangeForm {
                readonly control = new FormControl<KbqSliderValue>([20, 80], { updateOn: 'blur' });
            }

            const fixture = TestBed.createComponent(RangeForm);
            const { control } = fixture.componentInstance;
            const slider = fixture.debugElement.query(By.directive(KbqInputSlider)).injector.get(KbqInputSlider);
            const commit = vi.fn();

            slider.valueCommit.subscribe(commit);
            fixture.detectChanges();
            await fixture.whenStable();

            const editor: HTMLInputElement = fixture.nativeElement.querySelector('input.kbq-input');
            const thumb: HTMLInputElement = fixture.nativeElement.querySelector('input[type=range]');

            thumb.focus();
            editor.focus();
            expect(slider.focused()).toBe(true);
            expect(control.untouched).toBe(true);

            editor.value = '90';
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            expect(control.value).toEqual([20, 80]);
            editor.blur();

            expect(slider.focused()).toBe(false);
            expect(control.touched).toBe(true);
            expect(control.value).toEqual([80, 90]);
            expect(commit).toHaveBeenCalledExactlyOnceWith({ value: [80, 90], source: 'input' });
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
            fixture.componentRef.setInput('thumbCollisionBehavior', 'push');
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
            const escape = () => dispatchKeyboardEvent(editor, 'keydown', ESCAPE).defaultPrevented;

            editor.focus();
            expect(escape()).toBe(false);
            editor.value = '8';
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            expect(escape()).toBe(true);
            expect(editor.value).toBe('0');
            expect(escape()).toBe(false);
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
            dispatchKeyboardEvent(thumb, 'keydown', RIGHT_ARROW);
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
