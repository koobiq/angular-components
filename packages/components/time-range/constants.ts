import { InjectionToken } from '@angular/core';
import { KbqTimeRangeType } from './types';

export const KBQ_DEFAULT_TIME_RANGE_TYPES = new InjectionToken<KbqTimeRangeType[]>('KBQ_DEFAULT_TIME_RANGE_TYPES');

export function createMissingDateImplError(componentName: string, provider: string): Error {
    return Error(
        `${componentName}: No provider found for ${provider}. You must import one of the existing ` +
            `modules at your application root or provide a custom implementation or use exists ones.`
    );
}
