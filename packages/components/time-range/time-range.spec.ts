import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DebugElement, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule, LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE, KbqFormattersModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverComponent } from '@koobiq/components/popover';
import { KbqRadioButton } from '@koobiq/components/radio';
import { KBQ_CUSTOM_TIME_RANGE_TYPES, KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';
import { KbqTimeRangeModule } from './module';
import { KbqTimeRange } from './time-range';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqCustomTimeRangeType, KbqTimeRangeRange, KbqTimeRangeType } from './types';

const setup = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule, KbqLuxonDateModule, KbqFormattersModule],
        providers: [...providers]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getTriggerNativeElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqTimeRangeTitle)).nativeElement;
};

const getPopoverDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqPopoverComponent));
};

describe('KbqTimeRange', () => {
    describe('Component initialization', () => {
        it('should apply default configuration', () => {
            const { debugElement } = setup(TestComponent);

            expect(getTriggerNativeElement(debugElement).textContent).toMatchSnapshot();
        });

        it('should open popover when trigger is clicked', fakeAsync(() => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;
            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            expect(getPopoverDebugElement(debugElement)).toBeTruthy();
        }));

        it('should select first radio if no external value provided', fakeAsync(() => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;
            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);

            expect(popoverElement.queryAll(By.directive(KbqRadioButton))[0].classes['kbq-selected']).toBeTruthy();
        }));

        it('should select first radio if availableTimeRangeTypes provided', fakeAsync(() => {
            const fixture = setup(TestComponentWithInputs);
            const { debugElement } = fixture;
            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);

            expect(
                popoverElement
                    .queryAll(By.directive(KbqRadioButton))
                    .findIndex((element) => element.classes['kbq-selected'])
            ).toBe(0);
        }));

        it('should check selected radio if external value provided', fakeAsync(() => {
            const fixture = setup(TestComponentWithInitial);
            const { debugElement } = fixture;
            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);
            const checkedRadio: HTMLElement | undefined = popoverElement
                .queryAll(By.directive(KbqRadioButton))
                .find((element) => element.classes['kbq-selected'])?.nativeElement satisfies HTMLElement;

            expect({
                trigger: getTriggerNativeElement(debugElement).textContent,
                checkedRadio: checkedRadio?.textContent
            }).toMatchSnapshot();
        }));

        it('should check range as default if nothing provided', () => {
            const fixture = setup(TestComponentWithInputs);
            const { componentInstance } = fixture;
            const initial = componentInstance.control.value.type;

            componentInstance.availableTimeRangeTypes.set([]);
            fixture.detectChanges();

            expect({
                initial,
                current: componentInstance.control.value.type
            }).toMatchSnapshot();
        });

        it('should work with custom ranges', () => {
            const customTypes: KbqCustomTimeRangeType[] = [
                { type: 'last3Minutes', units: { minutes: -3 }, translationType: 'minutes' },
                { type: 'last3Weeks', units: { weeks: -3 }, translationType: 'weeks' },
                { type: 'last3Years', units: { years: -3 }, translationType: 'months' }
            ];

            const customDefaultTypes = customTypes.map(({ type }) => type);

            const fixture = setup(TestComponent, [
                { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] },
                { provide: KBQ_CUSTOM_TIME_RANGE_TYPES, useValue: customTypes },
                { provide: KBQ_DEFAULT_TIME_RANGE_TYPES, useValue: customDefaultTypes }
            ]);
            const { debugElement } = fixture;

            fixture.detectChanges();

            expect(getTriggerNativeElement(debugElement).textContent).toMatchSnapshot();
        });

        it('should apply custom option template in KbqTimeRangeEditor', fakeAsync(() => {
            const fixture = setup(TestTimeRangeCustomOption);
            const { debugElement } = fixture;

            fixture.detectChanges();

            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);

            expect(
                popoverElement.queryAll(By.css('.kbq-radio__text')).map((element) => element.nativeElement.textContent)
            ).toMatchSnapshot();
        }));
    });
});

@Component({
    imports: [KbqTimeRange],
    template: `
        <kbq-time-range />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent {}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithInitial {
    control = new FormControl<KbqTimeRangeRange>({ type: 'currentYear' }, { nonNullable: true });
}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [availableTimeRangeTypes]="availableTimeRangeTypes()" [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithInputs {
    availableTimeRangeTypes = signal<KbqTimeRangeType[]>([
        'lastMinute',
        'last5Minutes',
        'last15Minutes',
        'last30Minutes',
        'lastHour',
        'last24Hours',
        'last3Days',
        'last7Days',
        'last14Days',
        'last30Days',
        'last3Months',
        'last12Months',
        'allTime',
        'currentQuarter',
        'currentYear',
        'range'
    ]);
    control = new FormControl<KbqTimeRangeRange>({ type: this.availableTimeRangeTypes()[0] }, { nonNullable: true });
}

@Component({
    selector: 'time-range-custom-range-types-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRangeModule,
        LuxonDateModule,
        KbqIconModule,
        KbqFormFieldModule,
        TitleCasePipe
    ],
    template: `
        <ng-template #customOption let-context>
            {{ context.type | titlecase }}
        </ng-template>

        <kbq-time-range [optionTemplate]="customOption" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TestTimeRangeCustomOption {}
