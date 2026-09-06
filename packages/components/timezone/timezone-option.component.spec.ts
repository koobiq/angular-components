import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KBQ_TITLE_TEXT_REF } from '@koobiq/components/core';
import { KbqTimezoneOption } from './timezone-option.component';
import { KbqTimezoneOptionTooltip } from './timezone-option.directive';
import { KbqTimezoneZone } from './timezone.models';
import { KbqTimezoneModule } from './timezone.module';

@Component({
    imports: [KbqTimezoneModule],
    template: `
        <kbq-timezone-option [highlightText]="highlightText()" [timezone]="zone()" />
    `
})
class TimezoneOptionHost {
    readonly zone = signal<KbqTimezoneZone>({
        id: 'Europe/city3',
        offset: '03:00:00',
        city: 'city3',
        countryCode: 'ru',
        countryName: 'Russia',
        cities: 'city1, city2'
    });

    readonly highlightText = signal<string | readonly string[]>(undefined!);
}

describe('KbqTimezoneOption', () => {
    let fixture: ComponentFixture<TimezoneOptionHost>;

    const getOption = (): KbqTimezoneOption =>
        fixture.debugElement.query(By.directive(KbqTimezoneOption)).componentInstance;
    const getTooltip = (): KbqTimezoneOptionTooltip =>
        fixture.debugElement.query(By.directive(KbqTimezoneOption)).injector.get(KbqTimezoneOptionTooltip);
    const getText = (selector: string): string =>
        fixture.debugElement.query(By.css(selector)).nativeElement.textContent.trim();

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TimezoneOptionHost] });

        fixture = TestBed.createComponent(TimezoneOptionHost);
        fixture.detectChanges();
    });

    it('should compute viewValue from offset, city, and cities', () => {
        expect(getOption().viewValue).toBe('UTC+03:00 city3, city1, city2');
    });

    it('should render the offset in two columns', () => {
        const columns = fixture.debugElement
            .queryAll(By.css('.kbq-timezone-option__offset'))
            .map(({ nativeElement }) => nativeElement.textContent.trim());

        expect(columns).toEqual(['UTC', '+03:00']);
    });

    it('should derive the offset from the IANA id when the zone carries none', () => {
        jest.useFakeTimers().setSystemTime(Date.UTC(2026, 6, 15));

        fixture.componentInstance.zone.set({
            id: 'Europe/Berlin',
            city: 'Berlin',
            countryCode: 'de',
            countryName: 'Germany',
            cities: ''
        });
        fixture.detectChanges();

        expect(getText('.kbq-timezone-option__offset-wrapper')).toBe('UTC+02:00');

        jest.useRealTimers();
    });

    it('should resolve KBQ_TITLE_TEXT_REF to the option itself', () => {
        const option = fixture.debugElement.query(By.directive(KbqTimezoneOption));

        expect(option.injector.get(KBQ_TITLE_TEXT_REF)).toBe(option.componentInstance);
    });

    it('should point the inherited textElement at the city label', () => {
        expect(getOption().textElement.nativeElement).toBe(
            fixture.debugElement.query(By.css('.kbq-timezone-option__city')).nativeElement
        );
    });

    describe('with a search token', () => {
        beforeEach(() => {
            fixture.componentInstance.highlightText.set('city2');
            fixture.detectChanges();
        });

        it('should render only the matching cities', () => {
            expect(getText('.kbq-timezone-option__cities')).toBe('city2');
        });

        it('should mark the match', () => {
            const mark = fixture.debugElement.query(By.css('.kbq-timezone-option__cities mark'));

            expect(mark.nativeElement.className).toContain('kbq-highlight-background');
            expect(mark.nativeElement.textContent).toBe('city2');
        });

        it('should describe the same cities in the tooltip as in the rendered list', () => {
            expect(getOption().tooltipViewValue).toBe('UTC+03:00 city3, city2');
        });

        it('should keep the unfiltered list in viewValue, which labels the trigger', () => {
            expect(getOption().viewValue).toBe('UTC+03:00 city3, city1, city2');
        });
    });

    describe('overflow tooltip', () => {
        it('should carry the filtered text', () => {
            fixture.componentInstance.highlightText.set('city2');
            fixture.detectChanges();
            getTooltip().handleElementEnter();

            expect(getTooltip().content).toBe('UTC+03:00 city3, city2');
        });

        it('should not re-assign its state when the measured line count is unchanged', () => {
            const tooltip = getTooltip();
            const assign = jest.fn();
            // jsdom reports no client rects, so the measurement always says "fits, no tooltip needed".
            let disabled = true;

            Object.defineProperty(tooltip, 'disabled', {
                configurable: true,
                get: () => disabled,
                set: (value: boolean) => {
                    disabled = value;
                    assign(value);
                }
            });

            tooltip.handleElementEnter();

            expect(assign).not.toHaveBeenCalled();
        });
    });
});
