import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelect, KbqSelectModule, delayBeforeDisplayingResultWithoutOptions } from '@koobiq/components/select';

type State = 'loading' | 'error' | 'no-options';

@Component({
    selector: 'triage-select-all-with-states',
    imports: [KbqFormFieldModule, KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-select
                multiple
                selectAll
                placeholder="Food"
                [formControl]="control"
                (selectionChange)="selectionChanges = selectionChanges + 1"
            >
                @switch (state) {
                    @case ('loading') {
                        <kbq-select-loading />
                    }
                    @case ('error') {
                        <kbq-select-error>
                            <span kbq-select-error-text>Could not load the list</span>
                        </kbq-select-error>
                    }
                    @case ('no-options') {
                        <kbq-select-no-options>Nothing to choose from</kbq-select-no-options>
                    }
                }
            </kbq-select>
        </kbq-form-field>
    `
})
class SelectAllWithStates {
    state: State = 'loading';
    control = new UntypedFormControl();
    selectionChanges = 0;

    readonly select = viewChild.required(KbqSelect);
}

const stateSelectors: Record<State, string> = {
    loading: '.kbq-select-loading',
    error: '.kbq-select-error',
    'no-options': '.kbq-select-no-options'
};

describe('KbqSelect triage: "select all" row without options', () => {
    let fixture: ComponentFixture<SelectAllWithStates>;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [SelectAllWithStates] });
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(async () => {
        await vi.runOnlyPendingTimersAsync();
        vi.useRealTimers();
        overlayContainer.ngOnDestroy();
    });

    it.each<State>(['loading', 'error', 'no-options'])(
        'DEFECT: the row renders over the %s content, without aria-busy, and activating it does nothing',
        async (state) => {
            fixture = TestBed.createComponent(SelectAllWithStates);
            fixture.componentInstance.state = state;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const select = fixture.componentInstance.select();

            expect(select.noOptions).toBe(true);

            select.open();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(delayBeforeDisplayingResultWithoutOptions);
            fixture.detectChanges();

            const container = overlayContainer.getContainerElement();
            const listbox = container.querySelector<HTMLElement>('.kbq-select__content')!;
            const row = container.querySelector<HTMLElement>('.kbq-select__select-all');

            expect(select.panelOpen).toBe(true);
            expect(container.querySelector(stateSelectors[state])).not.toBeNull();
            expect(row).not.toBeNull();
            expect(listbox.getAttribute('aria-busy')).toBeNull();

            row!.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectionChanges).toBe(0);
            expect(fixture.componentInstance.control.value).toBeNull();
        }
    );
});
