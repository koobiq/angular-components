import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqTimeRange, KbqTimeRangeRange, KbqTimeRangeTitle } from '@koobiq/components/time-range';

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly control = new FormControl<KbqTimeRangeRange>({ type: 'lastHour' }, { nonNullable: true });
}

describe('triage: closing the time-range popover does not hand focus back to the trigger', () => {
    let fixture: ComponentFixture<TestApp>;
    let wrapper: HTMLElement;
    let link: HTMLElement;

    const settle = async (): Promise<void> => {
        for (let i = 0; i < 3; i++) {
            await vi.advanceTimersByTimeAsync(100);
            fixture.detectChanges();
        }
    };

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestApp, KbqLuxonDateModule, KbqFormattersModule] });
        fixture = TestBed.createComponent(TestApp);
        fixture.autoDetectChanges();

        wrapper = fixture.debugElement.query(By.directive(KbqTimeRangeTitle)).nativeElement;
        link = wrapper.querySelector('a')!;
    });

    afterEach(() => vi.useRealTimers());

    it('DEFECT: Cancel leaves focus on <body> instead of the trigger link', async () => {
        link.focus();
        expect(document.activeElement).toBe(link);

        link.click();
        await settle();

        const cancel = Array.from(document.querySelectorAll<HTMLButtonElement>('.kbq-time-range__buttons button'))[1];

        // jsdom lays nothing out, so the focus trap finds nothing tabbable: stand in for it.
        cancel.focus();
        expect(document.activeElement).toBe(cancel);

        cancel.click();
        await settle();

        expect(document.querySelector('.kbq-time-range__buttons')).toBeNull();
        // The popover restores focus to its own host, the wrapper, which is not focusable.
        expect(wrapper.getAttribute('aria-haspopup')).toBe('dialog');
        expect(wrapper.hasAttribute('tabindex')).toBe(false);
        expect(document.activeElement).not.toBe(link);
        expect(document.activeElement).toBe(document.body);
    });
});
