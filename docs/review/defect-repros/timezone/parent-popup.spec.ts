import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, getDebugNode, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KBQ_PARENT_POPUP, dispatchMouseEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTimezoneModule, KbqTimezoneOption, KbqTimezoneSelect, KbqTimezoneZone } from './index';
import { KbqTimezoneOptionTooltip, TOOLTIP_VISIBLE_ROWS_COUNT } from './timezone-option.directive';

const zones: KbqTimezoneZone[] = [
    {
        id: 'Europe/city1',
        offset: '03:00:00',
        city: 'city1',
        countryCode: 'ru',
        countryName: 'Russia',
        cities: 'city2, city3, city4, city5, city6, city7, city8, city9'
    },
    {
        id: 'Europe/city10',
        offset: '04:00:00',
        city: 'city10',
        countryCode: 'ru',
        countryName: 'Russia',
        cities: 'city11'
    }
];

@Component({
    imports: [KbqFormFieldModule, KbqTimezoneModule],
    template: `
        <kbq-form-field>
            <kbq-timezone-select>
                @for (zone of zones; track zone.id) {
                    <kbq-timezone-option [timezone]="zone" />
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class TimezoneSelectHost {
    readonly zones = zones;
    readonly select = viewChild.required(KbqTimezoneSelect);
    readonly options = viewChildren(KbqTimezoneOption);
}

@Component({
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select>
                <kbq-option style="max-width: 200px;" [value]="'value1'">
                    Long long long long Long long long long Long long long long Long long long long text
                </kbq-option>
                <kbq-option [value]="'value2'">Short</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class PlainSelectHost {
    readonly select = viewChild.required(KbqSelect);
}

describe('triage: KbqTimezoneSelect does not provide KBQ_PARENT_POPUP', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TimezoneSelectHost, PlainSelectHost] });
        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
    });

    afterEach(async () => {
        await vi.runOnlyPendingTimersAsync();
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: the overflow tooltip of a timezone option stays open after the panel closes', async () => {
        const fixture = TestBed.createComponent(TimezoneSelectHost);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const select = fixture.componentInstance.select();
        let closedEmissions = 0;

        select.closedStream.subscribe(() => closedEmissions++);

        fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(500);

        const optionEl = overlayContainerElement.querySelector<HTMLElement>('kbq-timezone-option')!;
        const tooltip = getDebugNode(optionEl)!.injector.get(KbqTimezoneOptionTooltip);

        // Nothing provides the token inside the timezone select, so the tooltip has no parent pop-up to follow.
        expect(getDebugNode(optionEl)!.injector.get(KBQ_PARENT_POPUP, null)).toBeNull();

        vi.spyOn(
            fixture.componentInstance.options()[0].tooltipContent().nativeElement,
            'getClientRects'
        ).mockReturnValue(new Array(TOOLTIP_VISIBLE_ROWS_COUNT + 1).fill({}) as unknown as DOMRectList);

        dispatchMouseEvent(optionEl, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(500);
        fixture.detectChanges();

        expect(tooltip.isOpen).toBe(true);
        expect(document.querySelectorAll('.kbq-tooltip__content').length).toBe(1);

        select.close();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(500);
        fixture.detectChanges();

        expect(select.panelOpen).toBe(false);
        expect(closedEmissions).toBe(1);
        // The option is out of the document, yet its tooltip is still on screen.
        expect(optionEl.isConnected).toBe(false);
        expect(tooltip.isOpen).toBe(true);
        expect(document.querySelectorAll('.kbq-tooltip__content').length).toBe(1);
    });

    it('CONTROL: the overflow tooltip of a kbq-select option is hidden when the panel closes', async () => {
        const fixture = TestBed.createComponent(PlainSelectHost);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const select = fixture.componentInstance.select();

        fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const optionEl = overlayContainerElement.querySelector<HTMLElement>('kbq-option')!;

        expect(getDebugNode(optionEl)!.injector.get(KBQ_PARENT_POPUP, null)).toBe(select);

        const textEl = optionEl.querySelector('.kbq-option-text') as HTMLElement;

        Object.defineProperty(textEl, 'clientWidth', { configurable: true, value: 100 });
        Object.defineProperty(textEl, 'scrollWidth', { configurable: true, value: 500 });

        dispatchMouseEvent(optionEl, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(500);
        fixture.detectChanges();

        expect(document.querySelectorAll('.kbq-tooltip__content').length).toBe(1);

        select.close();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(500);
        fixture.detectChanges();

        expect(select.panelOpen).toBe(false);
        expect(document.querySelectorAll('.kbq-tooltip__content').length).toBe(0);
    });
});
