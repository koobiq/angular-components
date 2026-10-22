import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent, KBQ_LOCALE_SERVICE, KbqLocaleServiceModule } from '@koobiq/components/core';
import { kbqInputLocaleConfigurationProvider, KbqInputModule, KbqNumberInput } from '@koobiq/components/input';

@Component({
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <input kbqNumberInput [formControl]="control" />
    `
})
class TestApp {
    readonly control = new FormControl<number | null>(1234.5);
}

describe('triage: overriding groupSeparator without viewGroupSeparator', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: in en-US renders 1234.5 as 1,234,5, which the next keystroke cannot parse', async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            imports: [KbqLocaleServiceModule, TestApp],
            providers: [
                kbqInputLocaleConfigurationProvider({ number: { groupSeparator: ['.'], fractionSeparator: ',' } })
            ]
        });
        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

        const fixture = TestBed.createComponent(TestApp);
        const settle = async () => {
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();
        };

        await settle();

        const input: HTMLInputElement = fixture.debugElement.query(By.directive(KbqNumberInput)).nativeElement;

        expect(input.value).toBe('1,234,5');

        input.value = '1,234,56';
        dispatchFakeEvent(input, 'input');
        await settle();

        expect(input.value).toBe('');
        expect(fixture.componentInstance.control.value).toBeNull();
    });
});
