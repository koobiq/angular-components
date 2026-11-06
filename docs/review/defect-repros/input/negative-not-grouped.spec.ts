import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    dispatchFakeEvent,
    KBQ_LOCALE_SERVICE,
    KbqLocaleServiceModule,
    ruRUFormattersData
} from '@koobiq/components/core';
import { KbqInputModule, KbqNumberInput } from '@koobiq/components/input';

const thinSpace = ruRUFormattersData.input.number.viewGroupSeparator;

@Component({
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <input data-testid="positive" kbqNumberInput [formControl]="positive" />
        <input data-testid="negative" kbqNumberInput [formControl]="negative" />
    `
})
class TestApp {
    readonly positive = new FormControl<number | null>(12000);
    readonly negative = new FormControl<number | null>(-12000);
}

describe('triage: negative values are never grouped under a startFormattingFrom threshold', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: in ru-RU a negative value renders without the group separator its positive twin gets', async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [KbqLocaleServiceModule, TestApp] });
        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('ru-RU');

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        const [positive, negative] = fixture.debugElement
            .queryAll(By.directive(KbqNumberInput))
            .map(({ nativeElement }) => nativeElement as HTMLInputElement);

        expect(ruRUFormattersData.input.number.startFormattingFrom).toBe(4);
        expect(positive.value).toBe(`12${thinSpace}000`);
        expect(negative.value.replace('−', '-')).toBe('-12000');

        // The same when the negative number is typed.
        negative.value = '-12345';
        dispatchFakeEvent(negative, 'input');
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        expect(negative.value.replace('−', '-')).toBe('-12345');
        expect(fixture.componentInstance.negative.value).toBe(-12345);
    });
});
