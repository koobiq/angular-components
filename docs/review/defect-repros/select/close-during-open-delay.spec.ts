import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelect, KbqSelectModule, delayBeforeDisplayingResultWithoutOptions } from '@koobiq/components/select';

@Component({
    selector: 'triage-loading-select',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Food">
                <kbq-select-loading />
            </kbq-select>
        </kbq-form-field>
    `
})
class LoadingSelect {
    readonly select = viewChild.required(KbqSelect);
}

describe('KbqSelect triage: close() during the open delay of a select without options', () => {
    let fixture: ComponentFixture<LoadingSelect>;
    let overlayContainer: OverlayContainer;

    beforeEach(async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [LoadingSelect] });
        overlayContainer = TestBed.inject(OverlayContainer);
        fixture = TestBed.createComponent(LoadingSelect);
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
    });

    afterEach(async () => {
        await vi.runOnlyPendingTimersAsync();
        vi.useRealTimers();
        overlayContainer.ngOnDestroy();
    });

    it('DEFECT: the panel still opens after close() was called within the delay', async () => {
        const select = fixture.componentInstance.select();

        expect(select.noOptions).toBe(true);

        select.open();
        fixture.detectChanges();

        // Still waiting out the delay.
        expect(select.panelOpen).toBe(false);

        select.close();
        fixture.detectChanges();

        await vi.advanceTimersByTimeAsync(delayBeforeDisplayingResultWithoutOptions);
        fixture.detectChanges();

        expect(select.panelOpen).toBe(true);
        expect(overlayContainer.getContainerElement().querySelector('.kbq-select__panel')).not.toBeNull();
    });
});
