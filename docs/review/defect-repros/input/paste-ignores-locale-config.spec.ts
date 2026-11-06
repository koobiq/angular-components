import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent, KBQ_LOCALE_SERVICE, KbqLocaleServiceModule } from '@koobiq/components/core';
import { kbqInputLocaleConfigurationProvider, KbqInputModule, KbqNumberInput } from '@koobiq/components/input';

@Component({
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <input data-testid="typed" kbqNumberInput [formControl]="typed" />
        <input data-testid="pasted" kbqNumberInput [formControl]="pasted" />
    `
})
class TestApp {
    readonly typed = new FormControl<number | null>(null);
    readonly pasted = new FormControl<number | null>(null);
}

function paste(element: HTMLElement, text: string): Event {
    const event = new Event('paste', { bubbles: true, cancelable: true });

    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    element.dispatchEvent(event);

    return event;
}

function insertFromPaste(element: HTMLInputElement, newText: string): void {
    const event = new Event('input', { bubbles: true });

    Object.defineProperty(event, 'inputType', { value: 'insertFromPaste' });
    element.value = newText;
    element.dispatchEvent(event);
}

async function typeAndPaste(text: string) {
    const fixture = TestBed.createComponent(TestApp);
    const settle = async () => {
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    await settle();

    const [typed, pasted] = fixture.debugElement
        .queryAll(By.directive(KbqNumberInput))
        .map(({ nativeElement }) => nativeElement as HTMLInputElement);

    typed.value = text;
    dispatchFakeEvent(typed, 'input');
    await settle();

    expect(paste(pasted, text).defaultPrevented).toBe(false);
    insertFromPaste(pasted, text);
    await settle();

    return { fixture, typed, pasted };
}

describe('triage: paste parsing ignores the configuration the field renders with', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: without KBQ_LOCALE_SERVICE, pasting 1,5 into the ru-RU-formatted field gives 15', async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [TestApp] });

        const { fixture, typed, pasted } = await typeAndPaste('1,5');

        expect(typed.value).toBe('1,5');
        expect(fixture.componentInstance.typed.value).toBe(1.5);

        expect(pasted.value).toBe('15');
        expect(fixture.componentInstance.pasted.value).toBe(15);
    });

    it('DEFECT: with kbqInputLocaleConfigurationProvider in en-US, paste still parses with the shipped en-US separators', async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            imports: [KbqLocaleServiceModule, TestApp],
            providers: [
                kbqInputLocaleConfigurationProvider({
                    number: { groupSeparator: ['.'], fractionSeparator: ',', viewGroupSeparator: '.' }
                })
            ]
        });
        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

        const { fixture, typed, pasted } = await typeAndPaste('1,5');

        expect(typed.value).toBe('1,5');
        expect(fixture.componentInstance.typed.value).toBe(1.5);

        expect(pasted.value).toBe('15');
        expect(fixture.componentInstance.pasted.value).toBe(15);
    });
});
