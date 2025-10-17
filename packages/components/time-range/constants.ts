import { InjectionToken } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { KbqTimeRangeService } from './time-range.service';
import { KbqCustomTimeRangeType, KbqTimeRangeType } from './types';

/** Preset of selectable time ranges, provided by DI. */
export const KBQ_DEFAULT_TIME_RANGE_TYPES = new InjectionToken<KbqTimeRangeType[]>('KBQ_DEFAULT_TIME_RANGE_TYPES');

/** Preset of custom time ranges, provided by DI. */
export const KBQ_CUSTOM_TIME_RANGE_TYPES = new InjectionToken<KbqCustomTimeRangeType[]>('KBQ_CUSTOM_TIME_RANGE_TYPES');

export function createMissingDateImplError(componentName: string, provider: string): Error {
    return Error(
        `${componentName}: No provider found for ${provider}. You must import one of the existing ` +
            `modules at your application root or provide a custom implementation or use exists ones.`
    );
}

export const rangeValidator = <T>(timeRangeService: KbqTimeRangeService<T>): ValidatorFn => {
    return (control: AbstractControl) => {
        const form = control.value;

        if (!form.fromTime || !form.fromDate || !form.toTime || !form.toDate) {
            return null;
        }

        const fromDateTime = timeRangeService.combineDateAndTime(form.fromDate, form.fromTime);
        const toDateTime = timeRangeService.combineDateAndTime(form.toDate, form.toTime);

        return timeRangeService.dateAdapter.compareDate(fromDateTime, toDateTime) > 0
            ? { fromIsGreaterThanTo: fromDateTime }
            : null;
    };
};
