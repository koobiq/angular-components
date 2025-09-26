import { ChangeDetectionStrategy, Component, DebugElement, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqPopoverComponent } from '@koobiq/components/popover';
import { KbqRadioButton } from '@koobiq/components/radio';
import { KbqTimeRange } from './time-range';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqTimeRangeRange, KbqTimeRangeType } from './types';

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
        it('should create component without errors', () => {
            const { debugElement } = setup(TestComponent);

            expect(debugElement.query(By.directive(KbqTimeRange))).toBeTruthy();
        });

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
    });
});

@Component({
    standalone: true,
    template: `
        <kbq-time-range />
    `,
    imports: [KbqTimeRange],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent {}

@Component({
    standalone: true,
    template: `
        <kbq-time-range [formControl]="control" />
    `,
    imports: [KbqTimeRange, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithInitial {
    control = new FormControl<KbqTimeRangeRange>({ type: 'currentYear' }, { nonNullable: true });
}

@Component({
    standalone: true,
    template: `
        <kbq-time-range [availableTimeRangeTypes]="availableTimeRangeTypes()" [formControl]="control" />
    `,
    imports: [KbqTimeRange, ReactiveFormsModule],
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
